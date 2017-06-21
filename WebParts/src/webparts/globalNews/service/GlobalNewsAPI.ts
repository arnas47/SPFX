export class GlobalNewsAPI{
    public static xhrRequest<T>(url: string, method: string = 'GET', headers: any = null, data: any = null): Promise<T> {
        return new Promise<T>((resolve, reject): void => {
            const xhr: XMLHttpRequest = new XMLHttpRequest();

            xhr.onreadystatechange = function (): void {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(this.response as T);
                    }
                    else if (this.status >= 400) {
                        var responseJson = JSON.parse(this.response);

                        reject({
                            message: responseJson["odata.error"].message.value,
                            statusText: this.statusText,
                            status: this.status
                        });
                    }
                }
            };

            xhr.open(method, url, true);

            if (headers === null) {
                xhr.setRequestHeader('Accept', 'application/json;odata=nometadata');
            }
            else {
                for (var header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header, headers[header]);
                    }
                }
            }

            xhr.send(data);
        });
    }
}