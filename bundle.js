/// <reference path="typings/main.d.ts"/>
/// <reference path="Core.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CryptoJS;
var PictureAdapter = (function () {
    function PictureAdapter(Name, URL, Caption) {
        this.Name = Name;
        this.URL = URL;
        this.Caption = Caption;
    }
    PictureAdapter.prototype.GetURL = function () {
        return this.URL;
    };
    PictureAdapter.prototype.GetCaption = function () {
        return this.Caption;
    };
    PictureAdapter.prototype.GetName = function () {
        return this.Name;
    };
    return PictureAdapter;
})();
var PictureStatsAdapter = (function (_super) {
    __extends(PictureStatsAdapter, _super);
    function PictureStatsAdapter(Name, URL, Caption, Wins, Loses, GalleryWinsPortion, GalleryLosesPortion) {
        _super.call(this, Name, URL, Caption);
        this.Wins = Wins;
        this.Loses = Loses;
        this.GalleryWinsPortion = GalleryWinsPortion;
        this.GalleryLosesPortion = GalleryLosesPortion;
    }
    PictureStatsAdapter.prototype.GetWinRate = function () {
        return this.Wins / (this.Wins + this.Loses);
    };
    PictureStatsAdapter.prototype.GetWins = function () {
        return this.Wins;
    };
    PictureStatsAdapter.prototype.GetLoses = function () {
        return this.Loses;
    };
    PictureStatsAdapter.prototype.GetGalleryWinsPortion = function () {
        return this.GalleryWinsPortion;
    };
    PictureStatsAdapter.prototype.GetGalleryLosesPortion = function () {
        return this.GalleryLosesPortion;
        ;
    };
    return PictureStatsAdapter;
})(PictureAdapter);
var Client;
(function (Client) {
    var RemoteGallery = (function () {
        function RemoteGallery(URL) {
            this.URL = URL;
        }
        RemoteGallery.prototype.GetPictures = function (galName) {
            var result = $.Deferred();
            var effectiveURL = this.URL + "/Gallery/?GalleryName=" + galName;
            var response = $.getJSON(effectiveURL);
            response.done(function (res) {
                var converted = res.map(function (picDesc) { return (new PictureAdapter(picDesc.Name, picDesc.URL, picDesc.Caption)); });
                result.resolve(converted);
            }).fail(function (error) { result.reject(error); });
            return result;
        };
        return RemoteGallery;
    })();
    Client.RemoteGallery = RemoteGallery;
    var RemoteVoter = (function () {
        function RemoteVoter(URL) {
            this.URL = URL;
        }
        RemoteVoter.prototype.Vote = function (picWin, picLose, username, authword) {
            var nameHash = CryptoJS.MD5(username + authword);
            var voteHash = CryptoJS.MD5(username + authword + picWin.GetName() + picLose.GetName());
            console.log("prefered " + picWin.GetName() + " to " + picLose.GetName() + ". UserSig " + nameHash);
            var effectiveURL = this.URL + "/Vote/?voteName=demo&username=" + username + "&picWin=" + picWin.GetName() + "&picLose=" + picLose.GetName() + "&userSig=" + nameHash + "&voteSig=" + voteHash;
            $.get(effectiveURL);
        };
        return RemoteVoter;
    })();
    Client.RemoteVoter = RemoteVoter;
    var RemoteGalleryStats = (function () {
        function RemoteGalleryStats(URL) {
            this.URL = URL;
        }
        RemoteGalleryStats.prototype.GetStats = function (galName) {
            var result = $.Deferred();
            var effectiveURL = this.URL + "/GalleryStats/?GalleryName=" + galName;
            var response = $.getJSON(effectiveURL);
            response.done(function (res) {
                var converted = res.map(function (p) { return (new PictureStatsAdapter(p.Name, p.URL, p.Caption, p.Wins, p.Loses, p.GalWinPortion, p.GalLosePortion)); });
                result.resolve(converted);
            }).fail(function (error) { result.reject(error); });
            return result;
        };
        return RemoteGalleryStats;
    })();
    Client.RemoteGalleryStats = RemoteGalleryStats;
})(Client || (Client = {}));
var Cookies;
(function (Cookies) {
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    Cookies.setCookie = setCookie;
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return "";
    }
    Cookies.getCookie = getCookie;
})(Cookies || (Cookies = {}));
/// <reference path="Core.ts" />
/// <reference path="Cookies.ts" />
var picturePlaceHolder = {
    GetCaption: function () { return "Loading..."; },
    GetName: function () { return "Picture placeholder"; },
    GetURL: function () { return "#"; }
};
var ViewModels;
(function (ViewModels) {
    var VoteVM = (function () {
        function VoteVM(gallery, voter, galleryName) {
            var _this = this;
            this.gallery = gallery;
            this.voter = voter;
            this.galleryName = galleryName;
            this.pictures = [];
            this.UserName = ko.observable("");
            this.picA = ko.observable(picturePlaceHolder);
            this.picB = ko.observable(picturePlaceHolder);
            this.Authword = ko.observable("");
            this.Authword2 = ko.observable("");
            this.CanRate = ko.pureComputed(function () {
                var nameFilled = _this.UserName().length > 0;
                var authworkFilled = _this.Authword().length > 0;
                var autwordsMatch = _this.AuthwordsMatch();
                return nameFilled && authworkFilled && autwordsMatch;
            });
            this.AuthwordsMatch = ko.pureComputed(function () {
                return _this.Authword() === _this.Authword2();
            });
            this.votedA = function () {
                _this.voter.Vote(_this.picA(), _this.picB(), _this.UserName(), _this.Authword());
                _this.Regenerate();
                _this.SaveCreds();
            };
            this.votedB = function () {
                _this.voter.Vote(_this.picB(), _this.picA(), _this.UserName(), _this.Authword());
                _this.Regenerate();
                _this.SaveCreds();
            };
            this.Regenerate = function () {
                var aIdx = Math.floor((Math.random() * _this.pictures.length));
                var bIdx = Math.floor((Math.random() * _this.pictures.length));
                if (aIdx === bIdx)
                    _this.Regenerate();
                else {
                    _this.picA(_this.pictures[aIdx]);
                    _this.picB(_this.pictures[bIdx]);
                }
            };
            this.UserName(Cookies.getCookie("username"));
            this.Authword(Cookies.getCookie("authword"));
            var picturesPromise = gallery.GetPictures(galleryName);
            picturesPromise
                .done(function (pictures) {
                _this.pictures = pictures;
                _this.Regenerate();
            })
                .fail(function (error) { return console.error(error); });
        }
        VoteVM.prototype.SaveCreds = function () {
            Cookies.setCookie("username", this.UserName(), 9999);
            Cookies.setCookie("authword", this.Authword(), 9999);
        };
        return VoteVM;
    })();
    ViewModels.VoteVM = VoteVM;
    ;
    var StatsVM = (function () {
        function StatsVM(stats) {
            this.stats = stats;
            this.Pictures = ko.observableArray();
        }
        StatsVM.prototype.Populate = function (galleryName) {
            var _this = this;
            var promise = this.stats.GetStats(galleryName);
            promise
                .done(function (pictures) {
                _this.Pictures(pictures);
            })
                .fail(function (error) { return console.error(error); });
        };
        return StatsVM;
    })();
    ViewModels.StatsVM = StatsVM;
})(ViewModels || (ViewModels = {}));
/// <reference path="typings/main.d.ts"/>
/// <reference path="Core.ts" />
/// <reference path="Client.ts" />
/// <reference path="ViewModel.ts" />
var backendURL = "http://home.dgrechka.net/PicsRating";
var galleryName = "demo";
var gallery = new Client.RemoteGallery(backendURL);
var voter = new Client.RemoteVoter(backendURL);
var galleryStats = new Client.RemoteGalleryStats(backendURL);
var voteVM = new ViewModels.VoteVM(gallery, voter, galleryName);
var statsVM = new ViewModels.StatsVM(galleryStats);
function getWinsProgressBar(wins, loses) {
    return (parseInt(wins) / (parseInt(wins) + parseInt(loses))) * 100.0 + "%";
}
function getLosesProgressBar(wins, loses) {
    return (parseInt(loses) / (parseInt(wins) + parseInt(loses))) * 100.0 + "%";
}
var isVotingMode = true;
function ToggleModes() {
    if (isVotingMode) {
        $("#voting").css("display", "none");
        $("#stats").css("display", "flex");
        $("#modesButton").text("Back to voting");
        statsVM.Populate(galleryName);
    }
    else {
        $("#voting").css("display", "flex");
        $("#stats").css("display", "none");
        $("#modesButton").text("Show voting results");
    }
    isVotingMode = !isVotingMode;
}
window.onload = function () {
    ko.applyBindings(voteVM, document.getElementById("voting"));
    ko.applyBindings(statsVM, document.getElementById("stats"));
};
//# sourceMappingURL=bundle.js.map