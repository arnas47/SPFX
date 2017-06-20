import { AllData } from '../service/IGlobalNewsData';
import { GlobalNewsMain } from '../service/GlobalNewsMain';

export interface IGlobalNewsProps {
  title: string;
  description: string;
  allData: AllData;
  service: GlobalNewsMain;
  siteUrl: string;
}

