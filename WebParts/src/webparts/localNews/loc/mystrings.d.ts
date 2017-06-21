declare interface ILocalNewsStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'localNewsStrings' {
  const strings: ILocalNewsStrings;
  export = strings;
}
