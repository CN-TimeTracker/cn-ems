export interface Holiday {
  _id: string;
  date: string;
  name: string;
  createdAt?: string;
}

export interface HolidayResponse {
  success: boolean;
  data: Holiday[];
  count: number;
}
