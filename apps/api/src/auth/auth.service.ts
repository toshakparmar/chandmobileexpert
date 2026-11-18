import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async loginWithFirebaseToken(idToken: string, requireAdmin: boolean = false) {
    try {
      let decodedToken;

      // Allow test token strictly in non-production environments when explicit flag is active
      if (idToken === 'test-admin-token-9999999999') {
        if (
          process.env.NODE_ENV === 'production' ||
          process.env.ALLOW_TEST_AUTH !== 'true'
        ) {
          throw new UnauthorizedException(
            'Test authentication is disabled in this environment.',
          );
        }
        decodedToken = {
          uid: 'test-admin-uid-9999999999',
          phone_number: '9999999999',
          name: 'Super Admin',
        };
      } else {
        try {
          decodedToken = await this.firebaseService
            .getAuth()
            .verifyIdToken(idToken);
        } catch (error) {
          throw new UnauthorizedException(
            'Invalid or expired Firebase ID token',
          );
        }
      }

      const { uid, email, phone_number, name, picture } = decodedToken;

      if (!email && !phone_number) {
        throw new BadRequestException(
          'Firebase token must contain either an email or phone number.',
        );
      }

      const orConditions: any[] = [{ firebaseUid: uid }];
      if (email) orConditions.push({ email });
      if (phone_number) orConditions.push({ phone: phone_number });

      // Try to find the user in our database
      let user = await this.prisma.user.findFirst({
        where: {
          OR: orConditions,
        },
      });

      // Create user if they don't exist
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firebaseUid: uid,
            email: email || null,
            phone: phone_number || null,
            firstName: name ? name.split(' ')[0] : 'Unknown',
            lastName:
              name && name.split(' ').length > 1
                ? name.split(' ').slice(1).join(' ')
                : 'User',
            profilePicture: picture || null,
            isEmailVerified: !!email,
            isPhoneVerified: !!phone_number,
            role: 'USER',
          },
        });
      } else {
        const updateData: any = {};
        if (picture && !user.profilePicture) {
          updateData.profilePicture = picture;
        }
        if (!user.firebaseUid) {
          updateData.firebaseUid = uid;
        }

        if (Object.keys(updateData).length > 0) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      }

      if (!user.isActive) {
        throw new UnauthorizedException(
          'User account is inactive. Please contact support.',
        );
      }

      if (requireAdmin && user.role !== 'SUPER_ADMIN') {
        throw new UnauthorizedException(
          'Access denied. Administrative privileges required.',
        );
      }

      // Generate Session JWT
      const payload = { sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user,
      };
    } catch (e: any) {
      throw new BadRequestException(
        e.message || 'Unknown error occurred in auth service',
      );
    }
  }

  async loginAdmin(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive.');
    }

    if (user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Access denied. Admins only.');
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(otp, user.password || '');

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user,
    };
  }
}
