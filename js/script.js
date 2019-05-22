"use strict";

const box_token = [1600, 2400, 2400, 2400, 2000, 6000];
const ratioHonorToToken = 6000/100000000;

function getTokenForBox(box_index) {
    if (box_index < 5) {
        return box_token[box_index-1];
    }
    else if (box_index < 45) {
        return box_token[4];
    }
    else {
        return box_token[5];
    }
}

function getTotalTokenToBox(box_index) {
    let total = 0;
    for (let box = 1; box <= box_index; box++) {
        total += getTokenForBox(box);
    }
    return total;
}

class BattleInfo {
    constructor(starterToken, victoryToken, mvpToken, soloHonor, AP, BP, meat) {
        this.starterToken = starterToken;
        this.victoryToken = victoryToken;
        this.mvpToken = mvpToken;
        this.soloHonor = soloHonor;
        this.AP = AP;
        this.BP = BP;
        this.meat = meat;
    }

    getTotalToken(countHonor=false) {
        if(countHonor) {
            return this.starterToken + this.victoryToken + this.mvpToken + this.soloHonor*ratioHonorToToken;
        }
        else {
            return this.starterToken + this.victoryToken + this.mvpToken;
        }
    }
}

var Ex      = new BattleInfo(22, 20, 14, 51000, 30, 1, 0);
var ExPlus  = new BattleInfo(26, 20, 20, 73000, 30, 1, 0);
var Hell90  = new BattleInfo(45, 20, 18, 260000, 30, 2, 5);
var Hell95  = new BattleInfo(55, 30, 26, 910000, 40, 3, 10);
var Hell100 = new BattleInfo(80, 48, 40, 2650000, 50, 3, 20);

function predictForBattle(battle, token, APFill) {
    let result = {}
    result["num"] = Math.ceil(token/battle.getTotalToken(true));
    if (result["num"] < 0){
        result["num"] = 0
    }
    result["elixir"] = Math.ceil(battle.AP*result["num"]/APFill);
    if (result["elixir"] < 0){
        result["elixir"] = 0
    }
    result["meat"] = result["num"] * battle.meat;
    if (result["meat"] < 0){
        result["meat"] = 0
    }
    return result;
}

function writeToStorage() {
    localStorage.setItem("APFill", $("#APFill").val());
    localStorage.setItem("targetBox", $("#targetBox").val());
    localStorage.setItem("drewBox", $("#drewBox").val());
    localStorage.setItem("currentToken", $("#currentToken").val());
    localStorage.setItem("currentHonor", $("#currentHonor").val());
}

function loadFromStorage() {
    $("#APFill").val(localStorage.getItem("APFill"));
    $("#targetBox").val(localStorage.getItem("targetBox"));
    $("#drewBox").val(localStorage.getItem("drewBox"));
    $("#currentToken").val(localStorage.getItem("currentToken"));
    $("#currentHonor").val(localStorage.getItem("currentHonor"));
}

function fillPredictTable(table, col, result) {
    $(table.rows[1].cells[col]).html(result["num"]);
    $(table.rows[2].cells[col]).html(result["elixir"]);
    $(table.rows[3].cells[col]).html(result["meat"]);
}

function readInput(id) {
    let variable = parseInt($('#'+id).val(),10);
    if(isNaN(variable)){
        variable = 0;
    }
    return variable;
}

function calculate() {
    writeToStorage();
    let APFill = readInput('APFill');
    let targetBox =  readInput('targetBox');
    let drewBox = readInput('drewBox');
    let currentToken = readInput('currentToken');
    let currentHonor = readInput('currentHonor');
    let currentMeat = 1111111;
    let ExDropMeat = 3;
    let ExPlusDropMeat = 3.5

    var requiredToken = getTotalTokenToBox(targetBox);
    var drewToken = getTotalTokenToBox(drewBox);
    var currentTokenFromHonor = Math.floor(currentHonor * ratioHonorToToken);

    $("#requiredToken").val(requiredToken);
    $("#drewToken").val(drewToken);
    $("#currentTokenFromHonor").val(currentTokenFromHonor);

    
    var restToken = requiredToken - drewToken - currentToken - currentTokenFromHonor;
    var ExPredict = predictForBattle(Ex, restToken, APFill);
    var ExPlusPredict = predictForBattle(ExPlus, restToken, APFill);
    var Hell90Predict = predictForBattle(Hell90, restToken, APFill);
    var Hell95Predict = predictForBattle(Hell95, restToken, APFill);
    var Hell100Predict = predictForBattle(Hell100, restToken, APFill);

    var table = $("#progress")[0];
    var restTokenNeeded = requiredToken-drewToken < 0 ? 0 : requiredToken-drewToken;
    $(table.rows[2].cells[1]).html(restTokenNeeded);
    $(table.rows[2].cells[2]).html(currentToken + currentTokenFromHonor);
    $(table.rows[1].cells[1]).html(requiredToken);
    $(table.rows[1].cells[2]).html(currentToken+currentTokenFromHonor+drewToken);

    
    if (requiredToken > 0) {
        var totalProgress = 100*(currentToken+currentTokenFromHonor+drewToken)/requiredToken;
    } else{
        var totalProgress = 100;
    }
    var totalProgress = 100*(currentToken+currentTokenFromHonor+drewToken)/requiredToken;
    $("#totalProgressBar").css("width", totalProgress + "%")
                          .attr("aria-valuenow", totalProgress)
                          .html(totalProgress + "% Complete");

                          
    if (restTokenNeeded > 0) {
        var restProgress = 100*(currentToken + currentTokenFromHonor) / (requiredToken-drewToken)
    } else{
        var restProgress = 100;
    }
    $("#restProgressBar").css("width", restProgress + "%")
                         .attr("aria-valuenow", restProgress)
                         .html(restProgress + "% Complete");

    var table = $("#predict")[0]
    fillPredictTable(table, 1, ExPredict);
    fillPredictTable(table, 2, ExPlusPredict);
    fillPredictTable(table, 3, Hell90Predict);
    fillPredictTable(table, 4, Hell95Predict);
    fillPredictTable(table, 5, Hell100Predict);
}

$(".trigger-cal").on('input click', calculate);

window.onload = function () { 
    loadFromStorage();
    calculate();
}