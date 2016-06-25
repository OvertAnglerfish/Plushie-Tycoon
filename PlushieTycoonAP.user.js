// ==UserScript==
// @name         Plushie Tycoon AP
// @version      0.02
// @description  An Autoplayer for the game Plushie Tycoon on Neopets
// @author       Overt Anglerfish
// @include      http://www.neopets.com/games/tycoon/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_log
// ==/UserScript==
 
var TIME_ZONE = 0;
 
if(GM_getValue("cashOnHand") === undefined){
    GM_setValue("cashOnHand", "Cash on Hand: xxxx NP");
}
 
GM_xmlhttpRequest({
  method: "GET",
  url: "http://www.neopets.com/games/tycoon/index.phtml",
  onload: function(response) {
    GM_setValue("cashOnHand",response.responseText);
  }
});
 
GM_xmlhttpRequest({
    method: "GET",
    url: "http://www.neopets.com/games/tycoon/factory.phtml?exist=1",
    onload: function(response) {
        GM_setValue("currentJobs",response.responseText);
    }
});
 
var $coh = GM_getValue("cashOnHand");
var $start = $coh.indexOf("Cash on Hand: ");
$start = $start + 13;
var $end = $coh.indexOf("<p>Plushie Tycoon time");
 
var $cash = $coh.substring($start,$end);
$cash = $cash.replace(' NP','');
$cash = $cash.replace(',','');
GM_log("cash = " + parseInt($cash));
$cash = parseInt($cash);
 
var currentJobs = GM_getValue("currentJobs");
if(currentJobs === undefined)
{
    currentJobs = "Boop.";
}
var numCurrentJobs = currentJobs.match(/<b>\d00<\/b>/g);
numCurrentJobs = numCurrentJobs ? numCurrentJobs.length : 0;
 
//Some useful variables
var MATERIAL_URLS = ["http://www.neopets.com/games/tycoon/materials_buy.phtml?item=0-3&catgor=0&factor=20&matvar=24",
                     "http://www.neopets.com/games/tycoon/materials_buy.phtml?item=1-0&catgor=1&factor=20&matvar=12",
                     "http://www.neopets.com/games/tycoon/materials_buy.phtml?item=2-0&catgor=2&factor=20&matvar=26",
                     "http://www.neopets.com/games/tycoon/materials_buy.phtml?item=3-0&catgor=3&factor=20&matvar=16"];
 
var MATERIALS = ["Green", "NeoCotton", "Rare Gems", "Velvet bags"];
 
var PLUSHIE_TYPES = ["Draik", "Elephante", "Lutari", "Xweetok", "Zafara"];
var PLUSHIE_CODES = [43, 22, 53, 51, 30];
 
var MATERIAL_QUANTITIES = [4, 1, 1, 1];
var MATERIAL_LOCATIONS = [3, 0, 0, 0];
 
var LANDING_PAGES = ["http://www.neopets.com/games/tycoon/materials.phtml?Cat=0",
                     "http://www.neopets.com/games/tycoon/materials.phtml?Cat=1",
                     "http://www.neopets.com/games/tycoon/materials.phtml?Cat=2",
                     "http://www.neopets.com/games/tycoon/materials.phtml?Cat=3"];
 
var RENTS = ["http://www.neopets.com/games/tycoon/factory.phtml?pay=1",
             "http://www.neopets.com/games/tycoon/store.phtml?pay=1",
             "http://www.neopets.com/games/tycoon/warehouse.phtml?pay=1",
             "http://www.neopets.com/games/tycoon/index.phtml"];
 
var MAIN_PAGE = "http://www.neopets.com/games/tycoon/index.phtml";
var START_JOB_PAGE = "http://www.neopets.com/games/tycoon/factory.phtml?start=1";
var HIRE_WORKERS_PAGE = "http://www.neopets.com/games/tycoon/factory.phtml?personnel=2&hire=1";
var FIRE_WORKERS_PAGE = "http://www.neopets.com/games/tycoon/factory.phtml?fire_all=1";
 
var HIRE_TRAINEES = "http://www.neopets.com/games/tycoon/workers_hire.phtml?worker=2";
var HIRE_MANAGERS = "http://www.neopets.com/games/tycoon/workers_hire.phtml?worker=4";
 
var WAREHOUSE = "http://www.neopets.com/games/tycoon/warehouse.phtml";
var SHOP = "http://www.neopets.com/games/tycoon/store.phtml";
 
var buyCounterMax = 5;
var rentCounterMax = 4;
var startJobCounterMax = 4;
var hireCounterMax = 12;
var plushieMakerCounterMax = 4;
var shipCounterMax = 2;
var standbyCounterMax = 3;
var setUpCounterMax = 18;
 
var status = GM_getValue("status");
var buyCounter = GM_getValue("buyCounter");
var bought = GM_getValue("bought");
var rentCounter = GM_getValue("rentCounter");
var startJobCounter = GM_getValue("startJobCounter");
var hireCounter = GM_getValue("hireCounter");
var jobsToMake = GM_getValue("jobsToMake");
var shipCounter = GM_getValue("shipCounter");
var plushieMakerCounter = GM_getValue("plushieMakerCounter");
var standbyCounter = GM_getValue("standbyCounter");
var workersFired = GM_getValue("workersFired");
var lastStandbyTime = GM_getValue("lastStandbyTime");
var setUpCounter = GM_getValue("setUpCounter");
var isRunning = GM_getValue("isRunning");
 
//initialize variables on first run
if(status === undefined || buyCounter === undefined || bought === undefined || rentCounter === undefined ||
   rentCounter === undefined || startJobCounter === undefined || hireCounter === undefined ||
   jobsToMake === undefined || shipCounter === undefined || plushieMakerCounter === undefined ||
   standbyCounter === undefined || workersFired === undefined || lastStandbyTime === undefined ||setUpCounter === undefined)
{
    GM_setValue("status", "Standby");
        GM_setValue("buyCounter", buyCounterMax);
        GM_setValue("bought", 0);
        GM_setValue("rentCounter", rentCounterMax);
        GM_setValue("startJobCounter", startJobCounterMax);
        GM_setValue("hireCounter", hireCounterMax);
        GM_setValue("jobsToMake", 0);
        GM_setValue("shipCounter", shipCounterMax);
        GM_setValue("plushieMakerCounter", plushieMakerCounterMax);
        GM_setValue("standbyCounter", standbyCounterMax);
    GM_setValue("setUpCounter", setUpCounterMax);
        GM_setValue("workersFired", false);
    GM_setValue("isRunning", false);
        var t = getNST();
    GM_setValue("lastStandbyTime", t[1]);
   
    status = GM_getValue("status");
    buyCounter = GM_getValue("buyCounter");
    bought = GM_getValue("bought");
    rentCounter = GM_getValue("rentCounter");
    startJobCounter = GM_getValue("startJobCounter");
    hireCounter = GM_getValue("hireCounter");
    jobsToMake = GM_getValue("jobsToMake");
    shipCounter = GM_getValue("shipCounter");
    plushieMakerCounter = GM_getValue("plushieMakerCounter");
    standbyCounter = GM_getValue("standbyCounter");
    workersFired = GM_getValue("workersFired");
    lastStandbyTime = GM_getValue("lastStandbyTime");
    setUpCounter = GM_getValue("setUpCounter");
}
 
var rentButton=document.createElement("input");
rentButton.type="button";
rentButton.value="Pay Rents";
rentButton.onclick = payRents;
 
var resetButton=document.createElement("input");
resetButton.type="button";
resetButton.value="Reset";
resetButton.onclick = reset;
 
var standbyButton=document.createElement("input");
standbyButton.type="button";
standbyButton.value="Force Standby";
standbyButton.onclick = standby;
 
var setUpButton=document.createElement("input");
setUpButton.type="button";
setUpButton.value="Set up new store";
setUpButton.onclick = setUp;
 
var startStopButton=document.createElement("input");
startStopButton.type="button";
if(isRunning)
{
    startStopButton.value="Stop";
}
else
{
    startStopButton.value="Start";
}
startStopButton.onclick = toggleProgram;
 
function toggleProgram()
{
    GM_setValue("isRunning", !isRunning);
    window.location = MAIN_PAGE;
}
 
var time = getNST();
if(time[1] < 10)
{
        time[1] = "0" + time[1];
}
       
if(window.location == MAIN_PAGE)
{
    $("img[alt='Plushie Tycoon']").after("<br><br>", rentButton, resetButton, "<br>", standbyButton, startStopButton);
    //GM_log("Cash:" + $cash);
    var cash = $cash;
    GM_log("Cash:" + cash);
    if(cash == 50000)
    {
        $('input[value="Start"]').after("<br>", setUpButton);
    }
}
 
/*if(indexOf("Your new Plushies Tycoon account has been created") != -1)
{
    $('input[value="Create Store"]').after("<br><br>", setUpButton);
}*/
 
 
function wait(func) {
  window.setTimeout(func, 500 + (500 * Math.random()));
}
 
function standby()
{
    var t = getNST();
    GM_setValue("workersFired", false);
    GM_setValue("lastStandbyTime", t[1]);
    GM_setValue("standbyCounter", 0);
    window.location = MAIN_PAGE;
}
 
function getNST(){
        $nst = $("#nst").text();
        if($("#nst:contains('pm')").length > 0){
                $pm = 1;
        }
        else{
                $pm = 0;
        }
        $nstSplit = $nst.split(":");
        $nstSplit[0] = parseInt($nstSplit[0]);
        $nstSplit[1] = parseInt($nstSplit[1]);
        if($pm == 1){
                $nstSplit[0] = $nstSplit[0] + 12;
        }
        return $nstSplit;
}
 
function getAllPrices(){
        var prices = new Array(4);
        for(i = 0; i < 4; i++){
                prices[i] = getPrice(i);
        }
        return prices;
}
 
function getPrice(cat){
    $url = "http://www.neopets.com/games/tycoon/materials.phtml?Cat=" + cat;
        GM_xmlhttpRequest({
                method: "GET",
                url: $url,
                onload: function(response) {
                        GM_setValue(cat,response.responseText);
                }
        });
        var source = GM_getValue(cat);
    var prices = source.match(/<td align='center'><b>\d*,*\d{2,3} NP<\/b><\/td>/g);
        var price = prices[MATERIAL_LOCATIONS[cat]];
    if(price === undefined)
    {
        price = "3000";
    }
    price = price.replace("<td align='center'><b>",'');
    price = price.replace('</b></td>','');
        price = price.replace(' NP','');
        price = price.replace(',','');
        return price;
}
 
function buyMaterials()
{
    GM_setValue("buyCounter",0);
    GM_setValue("bought", 0);
    GM_setValue("status", "Buying Materials");
    window.location = LANDING_PAGES[0];
}
function buyMaterialsHelper()
{
    if(buyCounter >= 0 && buyCounter < buyCounterMax-1 && bought == 2)
    {
        wait(function(){window.location = LANDING_PAGES[buyCounter];});
        GM_setValue("bought", 0);
    }
    else if(bought == 0)
    {
        wait(function(){$('b:contains(' + MATERIALS[buyCounter] + ')').click();});
        GM_setValue("bought", 1);
    }
    else if(bought == 1 && window.location.toString().indexOf("materials_buy.phtml?") > -1)
    {
        $('select').val(MATERIAL_QUANTITIES[buyCounter]).change();
        if(buyCounter == 2)
        {
            var pet = Math.floor(Math.random() * PLUSHIE_TYPES.length);
            GM_setValue("plushieCode", pet);
            $('select[name="pickpet"]').val(PLUSHIE_CODES[pet]).change();
        }
        wait(function() {$('input[name="purchaser"]').click();});
        GM_setValue("buyCounter", buyCounter+1);
        GM_setValue("bought", 2);
    }
    else if(buyCounter == 4)
    {
        window.location = MAIN_PAGE;
        GM_setValue("buyCounter", buyCounter+1);
    }
}
 
function setUp()
{
    GM_setValue("setUpCounter", 0);
    wait(function() {window.location = MAIN_PAGE;});
}
 
function setUpHelper()
{
    if(setUpCounter < setUpCounterMax)
    {
        if(setUpCounter == 0)
        {
            window.location = "http://www.neopets.com/games/tycoon/timezone.phtml";
        }
        else if(setUpCounter == 1)
        {
            $('select').val(TIME_ZONE).change();
            wait(function() {$('input[value="Change Zone"]').click();});
        }
        else if(setUpCounter == 2)
        {
            wait(function() {$('input[name="Submit"]:first').click();});
        }
        else if(setUpCounter == 3)
        {
            wait(function() {payRents();});
        }
        else if(setUpCounter == 4 && rentCounter == rentCounterMax)
        {
            window.location = "http://www.neopets.com/games/tycoon/store.phtml?Cat=1";
        }
        else if(setUpCounter == 5)
        {
            wait(function() {$('a:contains("Carpet")').click();});
        }
        else if(setUpCounter == 6 && window.location == "http://www.neopets.com/games/tycoon/ads_buy.phtml?ad=0&Cat=1")
        {
            $('select[name="amt"]').val("5-245").change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(setUpCounter == 7)
        {
            wait(function() {$('a:contains("Lighting")').click();});
        }
        else if(setUpCounter == 8 && window.location == "http://www.neopets.com/games/tycoon/ads_buy.phtml?ad=1&Cat=1")
        {
            $('select[name="amt"]').val("5-440").change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(setUpCounter == 9)
        {
            wait(function() {$('a:contains("Store Security")').click();});
        }
        else if(setUpCounter == 10 && window.location == "http://www.neopets.com/games/tycoon/ads_buy.phtml?ad=2&Cat=1")
        {
            $('select[name="amt"]').val("5-610").change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(setUpCounter == 11)
        {
            wait(function() {window.location = "http://www.neopets.com/games/tycoon/store.phtml?Cat=3";});
        }
        else if(setUpCounter == 12)
        {
            wait(function() {$('a:contains("Flyers")').click();});
        }
        else if(setUpCounter == 13 && window.location == "http://www.neopets.com/games/tycoon/ads_buy.phtml?ad=0&Cat=3")
        {
            $('select[name="amt"]').val("5-280").change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(setUpCounter == 14)
        {
            wait(function() {$('a:contains("Gifts")').click();});
        }
        else if(setUpCounter == 15 && window.location == "http://www.neopets.com/games/tycoon/ads_buy.phtml?ad=1&Cat=3")
        {
            $('select[name="amt"]').val("5-325").change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(setUpCounter == 16)
        {
            wait(function() {$('a:contains("Candy")').click();});
        }
        else if(setUpCounter == 17 && window.location == "http://www.neopets.com/games/tycoon/ads_buy.phtml?ad=2&Cat=3")
        {
            $('select[name="amt"]').val("5-400").change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else
        {
            setUpCounter -= 1;
        }
        GM_setValue("setUpCounter", setUpCounter + 1);
    }
}
 
function startJob()
{
    GM_setValue("startJobCounter", 0);
    GM_setValue("status", "Starting Jobs");
    wait(function() {window.location = START_JOB_PAGE;});
}
 
function startJobHelper()
{
    if(startJobCounter < startJobCounterMax)
    {
        if(startJobCounter == 0)
        {
            wait(function() {window.location = START_JOB_PAGE;});
        }
        if(startJobCounter == 1)
        {
            var pet = GM_getValue("plushieCode");
            $('select[name="pickpet"]').val(PLUSHIE_TYPES[pet]).change();
        }
        else if(startJobCounter == 2)
        {
            if($('b:contains("here")').length > 0)
            {                
                startJobCounter = -1;
                wait(function(){$('b:contains("here")').click();});
            }
            else
            {
                $('input[type="radio"]').prop('checked','checked');
                wait(function() {$('input[name="submitjob"]').click();});
            }
        }
        else if(startJobCounter == 3)
        {
            GM_xmlhttpRequest({
                method: "GET",
                url: "http://www.neopets.com/games/tycoon/factory.phtml?exist=1",
                onload: function(response) {
                    GM_setValue("currentJobs",response.responseText);
                }
            });
            var currentJobs = GM_getValue("currentJobs");
            var numCurrentJobs = currentJobs.match(/<b>\d00<\/b>/g);
            numCurrentJobs = numCurrentJobs ? numCurrentJobs.length : 0;
           
            var cash = $cash
            cash = cash - 6550 - 278 * numCurrentJobs;
            var totalCost = parseInt(getPrice(0))*4 + parseInt(getPrice(1)) + parseInt(getPrice(2)) + parseInt(getPrice(3)) + 278;
            var jobs = Math.floor(cash/totalCost);
           
            if(numCurrentJobs + jobs >= 18)
            {
                jobs = 18 - numCurrentJobs;
            }
            $('select[name="pickpet"]').val(1).change();
            GM_setValue("jobsToMake", jobs);
            wait(function() {$('input[value="Start Job"]').click();});
        }
        GM_setValue("startJobCounter", startJobCounter + 1);
    }
}
 
function fireWorkers()
{
    wait(function() {window.location = FIRE_WORKERS_PAGE;});
    GM_setValue("workersFired", true);
}
 
function hireWorkers()
{
    GM_setValue("status", "Hiring Workers");
    GM_setValue("hireCounter", 0);
    wait(function() {window.location = HIRE_WORKERS_PAGE;});
}
 
function hireWorkersHelper()
{
    hireCounter = GM_getValue("hireCounter");
    if(hireCounter < hireCounterMax)
    {
        if(hireCounter == 0)
        {
            wait(function() {window.location = HIRE_WORKERS_PAGE;});
        }
        if(hireCounter == 1 && window.location == HIRE_WORKERS_PAGE)
        {
            wait(function(){$('b:contains("Trainees")').click();});
        }
        else if(hireCounter == 2 && window.location == HIRE_TRAINEES)
        {
            $('select').val(250).change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(hireCounter == 3 || hireCounter == 6 || hireCounter == 9)
        {
            wait(function() {window.location = HIRE_WORKERS_PAGE;});
        }
        else if(hireCounter == 4 || hireCounter == 7)
        {
            wait(function(){$('b:contains("Managers")').click();});
        }
        else if((hireCounter == 5 || hireCounter == 8) && window.location == HIRE_MANAGERS)
        {
            $('select').val(10).change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        else if(hireCounter == 10)
        {
            wait(function(){$('b:contains("Managers")').click();});
        }
        else if(hireCounter == 11 && window.location == HIRE_MANAGERS)
        {
            $('select').val(4).change();
            wait(function() {$('input[name="purchaser"]').click();});
        }
        GM_setValue("hireCounter", hireCounter + 1);
    }
}
 
function payRents()
{
    GM_setValue("status", "Paying Rents");
    GM_setValue("rentCounter", 0);
    window.location = MAIN_PAGE;
}
 
function payRentsHelper()
{
    if(rentCounter < rentCounterMax)
    {
        wait(function() {window.location = RENTS[rentCounter];});
        GM_setValue("rentCounter", rentCounter+1);
    }
}
 
function makePlushies()
{
    var cash = $cash;
    cash = cash - 10000;
    var totalCost = parseInt(getPrice(0))*4 + parseInt(getPrice(1)) + parseInt(getPrice(2)) + parseInt(getPrice(3));
    var gemPrice = parseInt(getPrice(2));
    var jobsToMake = 0;
    if((totalCost * 4 < cash && (totalCost < 4000|| gemPrice < 1600)) || (totalCost * 8 < cash && totalCost < 6000))
    {
        GM_setValue("plushieMakerCounter", 0);
        //GM_log("Jobs would have been made");
        var jobs = Math.floor(cash/totalCost);
 
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://www.neopets.com/games/tycoon/factory.phtml?exist=1",
            onload: function(response) {
                GM_setValue("currentJobs",response.responseText);
            }
        });
        var currentJobs = GM_getValue("currentJobs");
        var numCurrentJobs = currentJobs.match(/<b>\d00<\/b>/g);
        numCurrentJobs = numCurrentJobs ? numCurrentJobs.length : 0;
        if(numCurrentJobs + jobs > 18)
        {
            jobs = 18 - numCurrentJobs;
        }
        //GM_log("jobsToMake: " + jobs);
        GM_setValue("jobsToMake", jobs);
        window.location = MAIN_PAGE;
    }
    else
    {
        //GM_log(cash);
        //GM_log(totalCost);
        GM_log("Jobs too expensive rn");
        var t = getNST();
        var lastStandbyTime = GM_getValue("lastStandbyTime");
        if((t[1] - lastStandbyTime + 60)% 60 >= 5)
        {
            GM_setValue("workersFired", false);
            GM_setValue("lastStandbyTime", t[1]);
            GM_setValue("standbyCounter", 0);
        }
    }
   
}
 
function makePlushiesHelper()
{
    if(plushieMakerCounter < plushieMakerCounterMax)
    {
        if(plushieMakerCounter == 0)
        {
            fireWorkers();
            GM_setValue("plushieMakerCounter", 1);
        }
        else if(plushieMakerCounter == 1)
        {
            hireWorkers();
            GM_setValue("plushieMakerCounter", 2);
        }
        else if(plushieMakerCounter == 2 && hireCounter == 12 && startJobCounter == 4)
        {
            if(jobsToMake > 0)
            {
                buyMaterials();
                GM_setValue("plushieMakerCounter", 3);
            }
            else
            {
                GM_setValue("plushieMakerCounter", 4);
            }
        }
        else if(plushieMakerCounter == 3 && buyCounter == 5)
        {
            startJob();
            GM_setValue("plushieMakerCounter", 2);
        }
    }
}
 
function shipPlushies()
{
    GM_setValue("status", "Shipping Plushies");
    GM_setValue("shipCounter", 0);
    window.location = WAREHOUSE;
}
 
function shipPlushiesHelper()
{
    if(shipCounter == 0)
    {
        var checkboxes = $(":checkbox");
        var cash = $cash;
        if(checkboxes.length == 0)
        {
            shipCounter = 1;
            wait(function() {window.location = MAIN_PAGE;});
        }
        else if(cash > 1078)
        {
            cash -= 800;
            var jobsToShip = checkboxes.length;
            if(jobsToShip * 278 > cash)
            {
                jobsToShip = Math.floor(cash/278);
            }
            checkboxes = $(":checkbox:lt("+jobsToShip+")");
            checkboxes.prop('checked', true);
            wait(function() {$('input[name="submit"]').click();});
        }
        GM_setValue("shipCounter", shipCounter +1);
    }
    else if(shipCounter == 1)
    {
        window.location = MAIN_PAGE;
        GM_setValue("shipCounter", shipCounter +1);
    }
}
 
function standbyTasks()
{
    if(standbyCounter < standbyCounterMax)
    {
        if(standbyCounter == 0)
        {
            shipPlushies();
            GM_setValue("standbyCounter", 1);
        }
        else if(standbyCounter == 1 && shipCounter == shipCounterMax)
        {
            GM_xmlhttpRequest({
                method: "GET",
                url: "http://www.neopets.com/games/tycoon/factory.phtml?exist=1",
                onload: function(response) {
                    GM_setValue("currentJobs",response.responseText);
                }
            });
            var currentJobs = GM_getValue("currentJobs");
            //GM_log(currentJobs);
            //GM_log("How many jobs are there?" + currentJobs.match(/<b>\d00<\/b>/g).length);
            GM_log("Are there jobs?" + currentJobs.indexOf("<b>0</b>"));
            if(currentJobs.indexOf("<b>0</b>") == -1 || $cash < 6550)
            {
                fireWorkers();
            }
            else
            {
                GM_setValue("workersFired", true);
            }
            GM_setValue("standbyCounter", 2);
        }
        else if(standbyCounter == 2 && workersFired)
        {
            window.location = SHOP;
            GM_setValue("standbyCounter", 3);
        }
    }
}
 
function upgradeShop()
{
    if(window.location == SHOP && $('a:contains("here")').length > 0)
    {
        window.location = "http://www.neopets.com/games/tycoon/store.phtml?expand=1";
    }
}
 
function reset()
{
    GM_setValue("status", "Standby");
    GM_setValue("buyCounter", buyCounterMax);
    GM_setValue("bought", 0);
    GM_setValue("rentCounter", rentCounterMax);
    GM_setValue("startJobCounter", startJobCounterMax);
    GM_setValue("hireCounter", hireCounterMax);
    GM_setValue("jobsToMake", 0);
    GM_setValue("plushieMakerCounter", plushieMakerCounterMax);
    GM_setValue("standbyCounter", standbyCounterMax);
    window.location = MAIN_PAGE;
    alert("Program reset.");
}
 
function main()
{
    setUpHelper();
    payRentsHelper();
   
    if(isRunning)
    {
        shipPlushiesHelper();
        makePlushiesHelper();
        buyMaterialsHelper();
        startJobHelper();
        hireWorkersHelper();
        standbyTasks();
        upgradeShop();
   
        if(plushieMakerCounter == plushieMakerCounterMax && shipCounter == shipCounterMax && standbyCounter == standbyCounterMax && currentJobs.indexOf("<b>0</b>") == -1)
        {
            makePlushies();
        }
    }
    window.setTimeout(function(){window.location = MAIN_PAGE; GM_setValue("status", "Standby");}, 120000 + (60000 * Math.random()));
}
 
main();
 
 
var totalCost = parseInt(getPrice(0))*4 + parseInt(getPrice(1)) + parseInt(getPrice(2)) + parseInt(getPrice(3));
$(".sidebarModule:last").css("margin-bottom","7px");
 
var module = '<div class="sidebarModule" style="margin-bottom: 7px;"><table width="158" cellpadding="2" cellspacing="0" border="0" class="sidebarTable">';
module += '<tr><td valign="middle" class="sidebarHeader medText"><a href="http://www.neopets.com/games/tycoon/index.phtml">Plushie Tycoon</a></td></tr>';
module += '<tr><td class="neofriend" align="center"><b>Cash on Hand:</b> ' + $cash;
var currstatus = GM_getValue("status");
module += '<br><b>Status:</b> ' + currstatus;
module += '<br><b>Price per job:</b> ' + totalCost;
module += "<br><b>Cloth:</b> " + getPrice(0);
module += " <b>Stuffing:</b> " + getPrice(1);
module += "<br><b>Gems:</b> " + getPrice(2);
module += " <b>Bags:</b> " + getPrice(3);
module += "<br><b>Last refresh:</b> " + time[0] + ":" +time[1];
module += '</td></tr></table></div>';
 
var debugModule = '<div class="sidebarModule" style="margin-bottom: 7px;"><table width="158" cellpadding="2" cellspacing="0" border="0" class="sidebarTable">';
debugModule += '<tr><td valign="middle" class="sidebarHeader medText">Debug Info</td></tr>';
debugModule += '<tr><td class="neofriend" align="left">';
debugModule += "<b>Total jobs in factory:</b> " + numCurrentJobs;
debugModule += "<br><b>New jobs in factory?</b> " + (currentJobs.indexOf("<b>0</b>") == -1 ? "Yes" : "No");    
debugModule += "<br><b>setUpCounter:</b> " + setUpCounter;
debugModule += "<br><b>lastStandbyTime:</b> " + lastStandbyTime;
debugModule += "<br><b>buyCounter:</b> " + buyCounter;
debugModule += "<br><b>bought:</b> " + bought;
debugModule += "<br><b>rentCounter:</b> " + rentCounter;
debugModule += "<br><b>startJobCounter:</b> " + startJobCounter;
debugModule += "<br><b>hireCounter:</b> " + hireCounter;
debugModule += "<br><b>jobsToMake:</b> " + jobsToMake;
debugModule += "<br><b>plushieMakerCounter:</b> " + plushieMakerCounter;
debugModule += "<br><b>shipCounter:</b> " + shipCounter;
debugModule += "<br><b>standbyCounter:</b> " + standbyCounter;
$(".sidebar").append(module, debugModule);
 
$("tr:contains('Total jobs in factory'):last").toggle();
 
$(".sidebarHeader:contains('Plushie Tycoon')").click(function(){
        $("tr:contains('Cash on Hand'):last").toggle();
});
 
$(".sidebarHeader:contains('Debug Info')").click(function(){
        $("tr:contains('Total jobs in factory'):last").toggle();
});
