/// <reference path="typings/main.d.ts"/>
namespace Core {
export interface IPicture {
    GetURL():string;    
    GetName():string;
    GetCaption():string;
}

export interface IGallery {
    GetPictures(name:string): JQueryPromise<Array<IPicture>>;
}

export interface IVote {
    Vote(picWin: IPicture,picLose: IPicture,username:string, authword:string):void;    
}
}