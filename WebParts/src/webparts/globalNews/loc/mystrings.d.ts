declare interface IGlobalNewsStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'globalNewsStrings' {
  const strings: IGlobalNewsStrings;
  export = strings;
}
