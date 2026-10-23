import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/portal.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public Portal')
@Public()
@Controller('public/portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post('otp/request')
  @ApiOperation({ summary: 'Request an OTP for portal access' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.portalService.requestOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and get portal token' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.portalService.verifyOtp(dto);
  }

  @Get('dashboard/:slug')
  @ApiOperation({ summary: 'Get portal dashboard data' })
  @ApiHeader({ name: 'x-portal-token', required: true })
  async getDashboard(
    @Param('slug') slug: string,
    @Headers('x-portal-token') token: string
  ) {
    if (!token) throw new UnauthorizedException('Missing portal token');
    return this.portalService.getDashboardData(slug, token);
  }
}
