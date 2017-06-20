import { AllData, Data } from '../service/IGlobalNewsData';
import { GlobalNewsMain } from '../service/GlobalNewsMain';

export interface IGlobalNewsProps {
  title: string;
  description: string;
  allData: AllData;
  latestNews: Data;
  service: GlobalNewsMain;
  siteUrl: string;
}

