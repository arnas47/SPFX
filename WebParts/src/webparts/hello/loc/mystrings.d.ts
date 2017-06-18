declare interface IHelloStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'helloStrings' {
  const strings: IHelloStrings;
  export = strings;
}
