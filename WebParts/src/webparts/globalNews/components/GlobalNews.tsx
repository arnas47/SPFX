import * as React from 'react';
import styles from './GlobalNews.module.scss';
import { IGlobalNewsProps } from './IGlobalNewsProps';
import { IGlobalNewsState } from './IGlobalNewsState';
import { escape } from '@microsoft/sp-lodash-subset';
import { GlobalNewsService } from '../service/GlobalNewsService';
import { Data } from '../service/IGlobalNewsData';
import { GlobalNewsCache } from '../service/GlobalNewsCache';

export default class GlobalNews extends React.Component<IGlobalNewsProps, IGlobalNewsState> {
  constructor(props: IGlobalNewsProps, state: IGlobalNewsState) {
    super(props);
    
    this.state = {    
      selected: 0
    };
  }

  private selectNewsType(index, event): void {
    event.preventDefault();

    this.setState((previousState: IGlobalNewsState, props: IGlobalNewsProps) => {
      previousState.selected = index;
      return previousState;
    });
  }

  private loadData(index: number, type: string): void{
    this.props.service.loadData(index, this.props.siteUrl).then((response: Data) => {
      this.setState((previousState: IGlobalNewsState, props: IGlobalNewsProps) => {
        props.allData[type] = response;

        if(type == "latestNews"){
            var json = JSON.stringify(props.allData[type]);
            GlobalNewsCookies.setCookie("LatestNews", json);
        }
      
        return previousState;
      });
    });  
  }

  private loadMoreData(index: number, type: string, event): void{
    this.props.service.loadMoreData(index, this.props.allData, this.props.siteUrl).then(response => {
      this.setState((previousState: IGlobalNewsState, props: IGlobalNewsProps) => {
        props.allData[type] = response;
        return previousState;
      });
    });  
  }

  public componentDidMount(): void {
    this.loadData(0, "latestNews");
    this.loadData(1, "news");
    this.loadData(2, "spn");
    this.loadData(3, "openPositions");
    this.loadData(4, "appointments");
    this.loadData(5, "blogs");
  }

  private contentPart(index: number, data: Data, type: string){
    return(
      <div className={(this.state.selected === index ? styles.active : '')}>
        <div className={styles.contentArea}>
          { data.items.map(item => {
              var parseDate = new Date(item.kemiraDateTimeRefinable).toLocaleDateString();
              return ( 
                <div className={styles.contentItem}>
                  <div className={styles.innerItemWrapper}>
                    <div className={styles.image}><img src={item.BannerImageUrl.Url+"?RenditionID=6"} /></div>
                    <div className={styles.metaData}>{parseDate} / {GlobalNewsService.getContentTypeName(item.ContentTypeId)}</div>
                    <div className={styles.title}><a href={item.FileRef} target="_blank">{item.Title}</a></div>
                    <div className={styles.description}>{item.kemiraNewsIngress}</div>
                  </div>
                </div>          
              );
          })}
        </div>
        <div className={styles.readMoreLink}>
          <a href="javascript:void(0)" className={(data.outOfData === true ? styles.activeMoreLink : '')} onClick={this.loadMoreData.bind(this, index, type)}>Load more</a>
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<IGlobalNewsProps> {
    return (
      <div className={styles.globalNews}>
        <div className={styles.innerWrapper}>
          <div className={styles.title}>{escape(this.props.title)}</div>       
          <div className={styles.navigation}>
            <ul>
              <li><a href="javascript:void(0)" onClick={this.selectNewsType.bind(this, 0)} className={(this.state.selected === 0 ? styles.activeMenuItem : '')}>LATEST</a></li>
              <li><a href="javascript:void(0)" onClick={this.selectNewsType.bind(this, 1)} className={(this.state.selected === 1 ? styles.activeMenuItem : '')}>NEWS</a></li>
              <li><a href="javascript:void(0)" onClick={this.selectNewsType.bind(this, 2)} className={(this.state.selected === 2 ? styles.activeMenuItem : '')}>STOCK & PRESS RELEASES</a></li>
              <li><a href="javascript:void(0)" onClick={this.selectNewsType.bind(this, 3)} className={(this.state.selected === 3 ? styles.activeMenuItem : '')}>OPEN POSITIONS</a></li>
              <li><a href="javascript:void(0)" onClick={this.selectNewsType.bind(this, 4)} className={(this.state.selected === 4 ? styles.activeMenuItem : '')}>APPOINTMENTS</a></li>
              <li><a href="javascript:void(0)" onClick={this.selectNewsType.bind(this, 5)} className={(this.state.selected === 5 ? styles.activeMenuItem : '')}>BLOGS</a></li>
            </ul>
          </div>      
          <div className={styles.contentWrapper}>
            { this.contentPart(0, this.props.allData.latestNews, "latestNews") }
            { this.contentPart(1, this.props.allData.news, "news") }
            { this.contentPart(2, this.props.allData.spn, "spn") }
            { this.contentPart(3, this.props.allData.openPositions, "openPositions") }
            { this.contentPart(4, this.props.allData.appointments, "appointments") }
            { this.contentPart(5, this.props.allData.blogs, "blogs") }
          </div>
        </div>
      </div>
    );
  }
}
