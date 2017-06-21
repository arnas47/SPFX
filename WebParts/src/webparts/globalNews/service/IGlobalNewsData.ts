export interface AllData{
  latestNews: Data;
  news?: Data;
  appointments?: Data;
  blogs?: Data;
  spn?: Data;
  openPositions?: Data;
}

export interface Data{
  items: Item[];
  excluded: Item[];
  outOfData: boolean;
}

export interface Item{
  Id: number;
  Title: string;
  FileRef: string;
  kemiraDateTimeRefinable: string;
  kemiraNewsIngress: string;
  BannerImageUrl: Image;
  ContentTypeId: string;
}

export interface Image{
    Url: string;
}




