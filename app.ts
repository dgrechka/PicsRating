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

function getWinsProgressBar(wins:string,loses:string) {
    return (parseInt(wins)/(parseInt(wins)+parseInt(loses)))*100.0+"%";
}

function getLosesProgressBar(wins:string,loses:string) {
    return (parseInt(loses)/(parseInt(wins)+parseInt(loses)))*100.0+"%";
}

var isVotingMode = true;

function ToggleModes() {
    if(isVotingMode) {
        $("#voting").css("display","none");
        $("#stats").css("display","flex");
        $("#modesButton").text("Back to voting")
        statsVM.Populate(galleryName);
    }
    else {
        $("#voting").css("display","flex");
        $("#stats").css("display","none");
        $("#modesButton").text("Show voting results");
    }
    isVotingMode = !isVotingMode;
}

window.onload = () => {
    ko.applyBindings(voteVM,document.getElementById("voting"));
    ko.applyBindings(statsVM,document.getElementById("stats"));
};