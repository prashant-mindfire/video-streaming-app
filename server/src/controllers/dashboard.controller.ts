import * as DashboardService from '@/services/dashboard.service';
import { responseHandler } from '@/utils/responseHandler';
import type { Request, Response } from 'express';

export const getDashboardOverview = async (_req: Request, res: Response) => {
  const dashboard = await DashboardService.getDashboardOverview();

  responseHandler(res, 200, 'Dashboard overview fetched successfully', {
    data: dashboard,
  });
};
