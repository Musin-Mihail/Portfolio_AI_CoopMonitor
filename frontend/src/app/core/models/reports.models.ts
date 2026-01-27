export interface ReportMetadata {
  id: number;
  houseId: number;
  houseName: string;
  reportType: string;
  reportDate: string;
  generatedAt: string;
  status: string;
}

export interface GenerateReportRequest {
  houseId: number;
  date: string;
  reportType: string;
}
