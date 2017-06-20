import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-webpart-base';

import * as strings from 'globalNewsStrings';
import GlobalNews from './components/GlobalNews';
import { IGlobalNewsProps } from './components/IGlobalNewsProps';
import { IGlobalNewsWebPartProps } from './IGlobalNewsWebPartProps';
import { GlobalNewsMain } from './service/GlobalNewsMain';
import { Data, AllData } from './service/IGlobalNewsData';
import { GlobalNewsCookies } from './service/GlobalNewsCookies';

export default class GlobalNewsWebPart extends BaseClientSideWebPart<IGlobalNewsWebPartProps> { 
  public render(): void {
    var service: GlobalNewsMain = new GlobalNewsMain(5);
    let data: Data = {
      items: [],
      excluded: [],
      outOfData: true
    };

    let allData: AllData = { 
      latestNews: data,
      news: data,
      spn: data,
      openPositions: data,
      appointments: data,
      blogs: data
    }; 

    console.log(GlobalNewsCookies.getCookie("LatestNews"));

    const element: React.ReactElement<IGlobalNewsProps> = React.createElement(
        GlobalNews,
        {
            title: this.properties.title,
            description: this.properties.description,
            allData: allData,
            latestNews: GlobalNewsCookies.getCookie("LatestNews"),
            service: service,
            siteUrl: this.context.pageContext.web.absoluteUrl
        }
    );

    ReactDom.render(element, this.domElement);  
  }

  protected get dataVersion(): Version {
      return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
      return {
          pages: [
              {
                  header: {
                      description: strings.PropertyPaneDescription
                  },
                  groups: [
                      {
                          groupName: strings.BasicGroupName,
                          groupFields: [PropertyPaneTextField('description', {
                                label: strings.DescriptionFieldLabel
                            })
                          ]
                      }
                  ]
              }
          ]
      };
  }
}
