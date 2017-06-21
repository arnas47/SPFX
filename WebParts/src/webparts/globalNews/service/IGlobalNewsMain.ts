import { AllData, Data } from './IGlobalNewsData';

export interface IGlobalNewsMain {
    // load specified amout of data on first load
    loadData(index: number, siteUrl: string): Promise<Data>;

    // load specified amount of data on "Load more" click
    loadMoreData(index: number, prevAllData: AllData, siteUrl: string): Promise<Data>; 
}