export interface VideoStreamMock {
  id: number;
  title: string;
  subTitle?: string;
  statusKey: string;
  fps: number;
  quality: string;
  time: string;
  cameraState: 'Normal' | 'Alert' | 'Error';
  alertCount: number;
  audioAlertCount?: number;
  imageUrl?: string;
  type?: 'rgb' | 'thermal';
  date?: string;
  eventTag?: {
    labelKey: string;
    type: 'danger' | 'warning' | 'info' | 'primary';
  };
}

export interface AiEventMock {
  time: string;
  titleKey: string;
  location: string;
  type: 'danger' | 'warning' | 'info' | 'primary';
}
