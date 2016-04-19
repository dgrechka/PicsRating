/// <reference path="typings/main.d.ts"/>
/// <reference path="Core.ts" />
/// <reference path="Client.ts" />
/// <reference path="ViewModel.ts" />

var backendURL = "http://home.dgrechka.net/PicsRating";

var galleryName= "itis_logo";

var gallery: Core.IGallery = new Client.RemoteGallery(backendURL);
var voter: Core.IVote = new Client.RemoteVoter(backendURL);
var galleryStats: Core.IGalleryStats = new Client.RemoteGalleryStats(backendURL);
        
var voteVM = new ViewModels.VoteVM(gallery,voter,galleryName);
var statsVM = new ViewModels.StatsVM(galleryStats);

function getMeterPadding(wins:string,loses:string) {
    if(parseInt(wins)>parseInt(loses))
        return "50%";
    else
        return (50.0-(parseInt(loses)-parseInt(wins)/(parseInt(loses)+parseInt(wins))*50.0))+"%";
}

function getMeter(wins:string,loses:string) {
    return (Math.abs(parseInt(wins)-parseInt(loses)/(parseInt(wins)+parseInt(loses))*50.0))+"%";
}

function GetStats() {
    statsVM.Populate(galleryName);
}

window.onload = () => {
    ko.applyBindings(voteVM,document.getElementById("voting"));
    ko.applyBindings(statsVM,document.getElementById("stats"));
};