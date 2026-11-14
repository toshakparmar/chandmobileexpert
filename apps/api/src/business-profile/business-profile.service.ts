import { Injectable, Logger } from '@nestjs/common';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { PrismaService } from '../prisma/prisma.service';

export const DEFAULT_BUSINESS_PROFILE = {
  id: 1,
  companyName: 'Chand Mobile Expert',
  email: 'chandmobileexpert@gmail.com',
  phone: '+91 97586 77978',
  whatsapp: '+919758677978',
  address: 'Main Market, Sarai Tarin, Sambhal, Uttar Pradesh – 244303',
  openingHours: 'Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 5:00 PM',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://www.instagram.com/chandmobileexpert/',
  twitterUrl: 'https://x.com',
  linkedinUrl: null,
};

@Injectable()
export class BusinessProfileService {
  private readonly logger = new Logger(BusinessProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: any) {
    try {
      return await this.prisma.businessProfile.upsert({
        where: { id: 1 },
        update: createDto,
        create: { ...DEFAULT_BUSINESS_PROFILE, ...createDto },
      });
    } catch (error: any) {
      this.logger.error(`Error in create business profile: ${error?.message || error}`);
      return { ...DEFAULT_BUSINESS_PROFILE, ...createDto };
    }
  }

  async findOne() {
    try {
      const profile = await this.prisma.businessProfile.findUnique({ where: { id: 1 } });
      if (!profile) {
        try {
          return await this.prisma.businessProfile.upsert({
            where: { id: 1 },
            update: {},
            create: DEFAULT_BUSINESS_PROFILE,
          });
        } catch {
          return DEFAULT_BUSINESS_PROFILE;
        }
      }
      return profile;
    } catch (error: any) {
      this.logger.warn(`Failed to retrieve business profile from DB: ${error?.message || error}. Falling back to default.`);
      return DEFAULT_BUSINESS_PROFILE;
    }
  }

  async update(updateDto: any) {
    try {
      return await this.prisma.businessProfile.upsert({
        where: { id: 1 },
        update: updateDto,
        create: { ...DEFAULT_BUSINESS_PROFILE, ...updateDto },
      });
    } catch (error: any) {
      this.logger.error(`Error in update business profile: ${error?.message || error}`);
      return { ...DEFAULT_BUSINESS_PROFILE, ...updateDto };
    }
  }
}