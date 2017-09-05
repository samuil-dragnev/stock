$(document).ready(function () {
    $("#startDate").datepicker({ dateFormat: 'yy-mm-dd' });
    $("#endDate").datepicker({ dateFormat: 'yy-mm-dd' });
    $("#startDateSearch").datepicker({ dateFormat: 'yy-mm-dd' });
    $("#endDateSearch").datepicker({ dateFormat: 'yy-mm-dd' });

    var margin = { top: 30, right: 50, bottom: 30, left: 50 },
       width = 600 - margin.left - margin.right,
       height = 330 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    var xGrid = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
        .tickSize(-height, 0, 0)
        .tickFormat("");

    var yGrid = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat("");

    var valueline = d3.svg.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.high); });

    console.log(myModelQuotes);
    var resultsRow = $( "#results" ),
        list = $( "#results>.panel>.panel-body>[class*='col-'] .list-group" ),
        queryInput = $( "#companyName" ),
        rssFeed = $( ".rssFeed" ),
        footer = $( '.quoteInfoFooter' ),
        tableOne = footer.find( "#quoteInfoMoreTableOne" ),
        tableTwo = footer.find( "#quoteInfoMoreTableTwo" ),
        stockModal = $( '#modalStock' ),
        aquireSharesFrom = stockModal.find( "#formAquireShares" ),
        myQuotesList = $(".myQuotesList");

    stockModal.on( 'hidden.bs.modal', function () {
        aquireSharesFrom.find("input[type=text], textarea").val("");
    });

    stockModal.on( 'show.bs.modal', function ( event ) {
        var rateArrow = stockModal.find( "#rateArrow" ),
            button = $( event.relatedTarget ),
            operation = button.data( 'whatever' ),
            amountToPay = $( "#amountToPayForShares" ),
            shares = $( "#aquireSharesNumber" ),
            currentBalance = parseFloat( $( "#currBalance" ).text()),
            amountShares = parseInt( shares.val() ),
            currentRateValue = parseFloat( stockModal.find( "#currentRate" ).text() ),
            currentBalanceElem = $( "#currentModalBalance" ),
            balanceArrow = $( "balanceArrow" ),
            aquireSharesPrice = aquireSharesFrom.find( "#aquireSharesPrice" );

        stockModal.find( "#btnOperation" ).text( operation );
        stockModal.find( '.modal-title' ).text( operation );
        shares.val( "" );

        aquireSharesFrom.find( "#aquireSharesName" ).val( $( "#searchSelectQuoteName" ).text() );
        aquireSharesFrom.find( "#aquireSharesSymbol" ).val( $( "#searchSelectQuoteSymbol" ).text() );
        aquireSharesFrom.find( "#aquireSharesIsBuyOrSell" ).val( operation );

        setInterval (function () {
            currentBalance = parseFloat( $( "#currBalance" ).text() );
            amountShares = parseInt( shares.val() );
            currentRateValue = parseFloat( stockModal.find( "#currentRate" ).text() );
            updateModal( stockModal, stockModal.find( "#currentRate" ),
                $( "#searchSelectQuoteSymbol" ).text(), operation, rateArrow,
                amountToPay, currentBalance, amountShares, stockModal.find( "#btnOperation" ),
                currentBalanceElem, balanceArrow, aquireSharesPrice );
        }, 1000);
        shares.change( function () {
            updateAmountToPay( amountToPay, currentBalance,
                amountShares, currentRateValue,
                stockModal.find( "#btnOperation" ), aquireSharesPrice );
        });
    });

    stockModal.on( "click" , "#btnOperation", function () {
        $.post("/Dashboard/AquireStock", aquireSharesFrom.serialize(), function (data) {
            if (data != null) {
                myModelQuotes.push(data);
                var item = $('<div class="list-group-item myQuote" style="margin-top: 5px"></div>'),
                    heading = $('<h5 class="list-group-item-heading" style="color: #114040">'),
                    body = $('<p class="list-group-item-text">');

                heading.append($('<span class="myQuoteId" style="display: none">' + data.QuoteId + '</span>'));
                heading.append($('<b>Name:</b> <span class="myQuoteName">' + data.Name + '</span>'));
                heading.append($('<br />'));
                heading.append($('<b>Symbol:</b> <span class="myQuoteSymbol">' + data.Symbol + '</span>'));

                body.append($('<b>Aquired shares:</b> <span class="myQuoteTradeDate">' + data.StockShares + '</span>'));
                body.append($('<br />'));
                body.append($('<b>Aquired type:</b> <span class="myQuoteTradeDate">' +  (data.IsBuyOrSell) ? "Asking" : "Bidding" + '</span>'));
                body.append($('<br />'));
                body.append($('<b>Aquired for:</b> <span class="myQuoteTradeDate">' + data.StockPrice + '</span>'));
                body.append($('<br />'));
                body.append($('<b>Aquired on:</b> <span class="myQuoteTradeDate">' + $.datepicker.formatDate('mm-dd-y H:mm:ss', new Date(parseInt(data.TradeDate.replace('/Date(', '')))) + '</span>'));
                body.append($('<button type="button" class="btn btn-primary btnMyQuoteView">View</button>'));
                item.append(heading);
                item.append(body);
                myQuotesList.append(item);
                stockModal.modal('hide');
            }
        });
    });

    $("#btnClear").click(function () {
        resultsRow.hide();
        list.empty();
        tableOne.find("tr").remove();
        tableTwo.find("tr").remove();
        rssFeed.find(".yahooItem").remove();
        $("#searchSelectedQuotePanel").hide();
        $(this).hide();
    });


    $("#btnCollect").on("click", function () {
        var modalCollect = $("#modalCollect"),
                modalHeader = modalCollect.find(".modal-header"),
                modalTitle = modalHeader.find(".modal-title"),
                modalBody = modalCollect.find(".modal-body");
        var data = {};
        for (var i = 0; i < myModelQuotes.length; i++) {
            if (myModelQuotes[i].Symbol === $("#myQuoteSymbol").text()) {
                data = myModelQuotes[i];
            }
        }
        modalTitle.find("#collectName").text(data.Name);
        modalTitle.find("#collectSymbol").text(data.Symbol);
        modalTitle.find("#collectType").text((data.IsBuyOrSell) ? "Asking" : "Bidding");

        modalBody.find("#collectShares").text(data.StockShares);
        modalBody.find("#collectInvested").text(data.StockPrice);
        modalBody.find("#collectCurrWorth").text((data.StockShares * ((data.IsBuyOrSell) ? parseFloat($("#myQuoteAsk").text()) : parseFloat($("#myQuoteBid").text()))).toFixed(2));
        modalBody.find("#collectProfit").text((parseFloat(modalBody.find("#collectCurrWorth").text()) - data.StockPrice).toFixed(2));
        modalCollect.find(".collectCurrency").text(data.Currency);

        $("#collectForm").find("[name='stockId']").val(data.QuoteId);
        
        modalCollect.modal("show");
    });

    $("#btnModalCollect").on("click", function () {
        $.post("/Dashboard/CollectStock", $("#collectForm").serialize(), function (data) {
            if (data != null) {
                if (data == true) {
                    var stockId = $("#collectForm").find("[name='stockId']").val();
                    var item = {};
                    myQuotesList.find(".myQuote").each(function () {
                        var id = $(this).find(".myQuoteId").text();
                        if (id === stockId) {
                            item = $(this);
                        }
                    });
                    item.remove();
                    $("#myQuoteInfo").hide();
                    $("#modalCollect").modal("hide");
                }
            }
        });
    });

    setInterval(function () {
        if ($("#modalCollect").is(":visible")) {
            var modalCollect = $("#modalCollect"),
                modalHeader = modalCollect.find(".modal-header"),
                modalTitle = modalHeader.find(".modal-title"),
                modalBody = modalCollect.find(".modal-body");
            var data = {};
            for (var i = 0; i < myModelQuotes.length; i++) {
                if (myModelQuotes[i].Symbol === modalTitle.find("#collectSymbol").text()) {
                    data = myModelQuotes[i];
                }
            }

            var oldVal = parseFloat(modalBody.find("#collectProfit").text());
            modalBody.find("#collectCurrWorth").text((data.StockShares * ((data.IsBuyOrSell) ? parseFloat($("#myQuoteAsk").text()) : parseFloat($("#myQuoteBid").text()))).toFixed(2));
            if (data.IsBuyOrSell) {
                modalBody.find("#collectProfit").text((parseFloat(modalBody.find("#collectCurrWorth").text()) - data.StockPrice).toFixed(2));
            } else {
                modalBody.find("#collectProfit").text(((parseFloat(modalBody.find("#collectCurrWorth").text()) - data.StockPrice) * -1).toFixed(2));
            }

            var currVal = parseFloat(modalBody.find("#collectProfit").text());
            changeArrowRisingFalling($("#collectArrow"), currVal, oldVal);
        }
    }, 1000);

    

    //Combine 
    setInterval(function () {
        var oldProfitValue = parseFloat($("#currProfit").text());
        $.get("/Dashboard/GetStockAndBalanceUpdate", "",
            function (data) {
                $("#currInvested").text(data.Invested);
                var currentProfitValue = parseFloat(data.Profit);
                changeArrowRisingFalling($("#arrowProfit"), currentProfitValue, oldProfitValue);
                $("#profitPercent").text((currentProfitValue / parseFloat($("#currInvested").text()) * 100).toFixed(2) + " %")
                $("#currProfit").text(currentProfitValue.toFixed(2));
                var currentBalanceValue = parseFloat(data.Balance);
                $("#currBalance").text(currentBalanceValue.toFixed(2));
            });
    }, 1000);

    $("#btnSearchFriend").click(function () {
        $.get("/Dashboard/FindFriend", { userName: $("#friendUserName").val() },
            function (data) {
                var searchFriendResult = $("#searchFriendResult");
                var searchFriendError = $("#searchFriendError");
                if (data != null) {
                    if (data != false) {
                        searchFriendError.hide();
                        searchFriendResult.find("#searchFriendResultId").text(data.Id);
                        searchFriendResult.find("#searchFriendResultName").text(data.FirstName + " " + data.LastName);
                        searchFriendResult.find("#searchFriendResultEmail").text(data.Email);
                        searchFriendResult.show();

                    } else {
                        searchFriendResult.hide();
                        searchFriendError.show();
                    }
                }
            });
    });

    $("#btnAddFriend").click(function () {
        $.get("/Dashboard/AddFriend", { id: $("#searchFriendResultId").text() },
            function (data) {
                if (data != false) {
                    var item = $('<div class="list-group-item myFriend" style="margin-top: 5px"></div>');
                    var heading = $('<h5 class="list-group-item-heading" style="color: #114040"></h5>');
                    var body = $('<p class="list-group-item-text"></p>');

                    var uName = $('<span class="myFriendUsername"></span>');
                    uName.text(data.UserName);
                    heading.append($("<b>Username:</b>"));
                    heading.append(uName);

                    var name = $('<span class="myFriendName"></span>');
                    var email = $('<span class="myFriendEmail"></span>')
                    name.text(data.FirstName + " " + data.LastName);
                    email.text(data.Email);
                    body.append($("<b>Username:</b>"));
                    body.append(name);
                    body.append($("<br />"));
                    body.append($("<b>E-mail:</b>"));
                    body.append(email);
                    body.append($('<button type="button" class="btn btn-primary btnMyFriendChat">Chat</button>'));
                    item.append(heading);
                    item.append(body);
                    $(".myFriendsList").append(item);
                    $("#searchFriendResultId").text('');
                    $("#friendUserName").val("");
                    $("#searchFriendResult").hide();
                }
            });
    });

    $("#btnSearch").click(function () {
        var query = queryInput.val();
        $("#btnClear").click();
        if (query.length > 2) {
            $.ajax({
                type: "GET",
                url: "http://d.yimg.com/autoc.finance.yahoo.com/autoc",
                data: { query: query },
                dataType: "jsonp",
                jsonp: "callback",
                jsonpCallback: "YAHOO.Finance.SymbolSuggest.ssCallback"
            });
        }

        YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {
            list.empty();
            var item = $('<a class="list-group-item searchQuoteLink"></a>'),
                header = $('<h4 class="list-group-item-heading"></h4>'),
                content = $('<p class="list-group-item-text"></p>'),
                btnView = $('<button type="button" class="button btn-primary btnSearchView">View</button>');

            resultsRow.show();
            var quotes = data.ResultSet.Result;
            if (quotes.length === 0) {

                list.append(item);
                item.append(header);
                item.append(content);
                header.text("No match found!");
                setTimeout(function () {
                    resultsRow.hide();
                }, 2500);
            }
            else {
                $("#btnClear").show();
                for (var i = 0; i < quotes.length; i++) {
                    item = $('<div class="list-group-item searchQuoteLink"></div>');
                    header = $('<h5 class="list-group-item-heading">'
                        + 'Name: <span class="searchStockName"></span>'
                        + '<br />'
                        + 'Symbol: <span class="searchSymbol"></span>'
                        + '</h5>');
                    content = $('<p class="list-group-item-text"></p>');
                    btnView = $('<button type="button" class="btn btn-primary btnSearchView">View</button>');
                    list.append(item);
                    item.append(header);
                    item.append(content);
                    item.append(btnView);

                    item.find(".searchStockName").text(quotes[i].name);
                    item.find(".searchSymbol").text(quotes[i].symbol);

                    content.text("Stock exchange: " + quotes[i].exchDisp);
                }
            }
        };
    });
    myQuotesList.on("click", ".btnMyQuoteView", function () {
        $("#myQuoteInfo").show();
        $("#myQuoteTableOne").find("tr").remove();
        $("#myQuoteTableTwo").find("tr").remove();
        var mySelectedQuote = $(this).closest(".myQuote");
        var mySelectedQuoteId = mySelectedQuote.find(".myQuoteId");
        var mySelectedQuoteInfo = null;

        for (var i = 0; i < myModelQuotes.length; i++) {
            if (myModelQuotes[i].QuoteId === parseInt(mySelectedQuoteId.text())) {
                mySelectedQuoteInfo = myModelQuotes[i];
            }
        }
        var rssFeedMyStock = $(".rssFeedMyStock");
        var yahooInfo = rssFeedMyStock.find(".thumbnail.yahooRssMyStock"),
                    image = yahooInfo.find(".yahooImageMyStock"),
                    newsLink = yahooInfo.find(".yahooLinkMyStock");
        image.attr("src", mySelectedQuoteInfo.Channel.Image.Url);
        newsLink.attr("href", mySelectedQuoteInfo.Channel.Image.Link);
        newsLink.text(mySelectedQuoteInfo.Channel.Image.Title);

        for (var i = 0; i < mySelectedQuoteInfo.Channel.Items.length; i++) {
            var item = mySelectedQuoteInfo.Channel.Items[i],
                itemPanel = $('<div class="panel panel-default yahooItemMyStock" style="margin-top: 5px"></div>'),
                itemMedia = $('<div class="media well"></div>'),
                itemMediaBody = $('<div class="media-body"></div>'),
                itemMediaBodyHeading = $('<h4 class="media-heading"></h4>'),
                itemMediaHeaderLink = $('<a target="_blank"></a>'),
                itemDescription = $('<p></p>'),
                itemPubDate = $('<p></p>');

            itemPubDate.text(item.PubDate);
            itemDescription.text(item.Description);
            itemMediaHeaderLink.attr('href', item.Link);
            itemMediaHeaderLink.text(item.Title);

            itemMediaBodyHeading.append(itemMediaHeaderLink);
            itemMediaBody.append(itemMediaBodyHeading);
            itemMediaBody.append(itemDescription);
            itemMediaBody.append(itemPubDate);

            itemMedia.append(itemMediaBody);
            itemPanel.append(itemMedia);
            rssFeedMyStock.append(itemPanel);
        }

        $("#myQuoteSymbol").text(mySelectedQuoteInfo.Symbol);
        $("#myQuoteVolume").text(mySelectedQuoteInfo.Volume);
        $("#myQuoteAsk").text(mySelectedQuoteInfo.Ask);
        $("#myQuoteBid").text(mySelectedQuoteInfo.Bid);
        $(".myQuoteCurrency").text(mySelectedQuoteInfo.Currency);
        moreInfoTable(mySelectedQuoteInfo, $("#myQuoteTableOne"), $("#myQuoteTableTwo"));
        $("#myQuoteHistory").find("svg").remove();
        graphInit(d3.select("#myQuoteHistory"), $("#myQuoteSymbol").text());
    });

    setInterval(function () {
        if ($("#myQuoteInfo").is(":visible")) {
            var symbol = $("#myQuoteSymbol").text(),
                volumeUpdate = $("#myQuoteVolume"),
                askUpdate = $("#myQuoteAsk"),
                bidUpdate = $("#myQuoteBid");

            updateQuote(symbol, askUpdate, bidUpdate, volumeUpdate, $("#myQuoteAskArrow"), $("#myQuoteBidArrow"));
        }
    }, 1000);

    $(".mySearchQuoteResults").on("click", ".btnSearchView", function () {
        $.get("/Dashboard/GetQuoteBySymbol", {
            symbol: $(this).closest(".searchQuoteLink").find(".searchSymbol").text()
        }, function (data) {
            if (data !== null) {
                tableOne.find("tr").remove();
                tableTwo.find("tr").remove();
                rssFeed.find(".yahooItem").remove();

                var yahooInfo = $(".thumbnail.yahooRss"),
                    image = yahooInfo.find(".yahooImage"),
                    newsLink = yahooInfo.find(".yahooLink");

                image.attr("src", data.Channel.Image.Url);
                newsLink.attr("href", data.Channel.Image.Link);
                newsLink.text(data.Channel.Image.Title);
                for (var i = 0; i < data.Channel.Items.length; i++) {
                    var item = data.Channel.Items[i],
                        itemPanel = $('<div class="panel panel-default yahooItem" style="margin-top: 5px"></div>'),
                        itemMedia = $('<div class="media well"></div>'),
                        itemMediaBody = $('<div class="media-body"></div>'),
                        itemMediaBodyHeading = $('<h4 class="media-heading"></h4>'),
                        itemMediaHeaderLink = $('<a target="_blank"></a>'),
                        itemDescription = $('<p></p>'),
                        itemPubDate = $('<p></p>');

                    itemPubDate.text(item.PubDate);
                    itemDescription.text(item.Description);
                    itemMediaHeaderLink.attr('href', item.Link);
                    itemMediaHeaderLink.text(item.Title);

                    itemMediaBodyHeading.append(itemMediaHeaderLink);
                    itemMediaBody.append(itemMediaBodyHeading);
                    itemMediaBody.append(itemDescription);
                    itemMediaBody.append(itemPubDate);

                    itemMedia.append(itemMediaBody);
                    itemPanel.append(itemMedia);
                    rssFeed.append(itemPanel);
                }

                var selectedQuote = data.Quote,
                    currency = $(".searchSelectQuoteCurrency");
                $("#searchSelectQuoteName").text(selectedQuote.Name);
                $("#searchSelectQuoteSymbol").text(selectedQuote.Symbol);
                $("#searchSelectQuoteVolume").text(selectedQuote.Volume);
                $("#searchSelectQuoteRealTimeAsk").text(selectedQuote.Ask);
                $("#searchSelectQuoteRealTimeBid").text(selectedQuote.Bid);

                moreInfoTable(selectedQuote, tableOne, tableTwo);

                currency.text(selectedQuote.Currency);
                $("#myQuoteHistorySearch").find("svg").remove();
                graphInit(d3.select("#myQuoteHistorySearch"),  $("#searchSelectQuoteSymbol").text());
                $("#searchSelectedQuotePanel").show();
            }
        });
    });

    setInterval(function () {
        if ($("#searchSelectedQuotePanel").is(":visible")) {
            var symbol = $("#searchSelectQuoteSymbol").text(),
                volumeUpdate = $("#searchSelectQuoteVolume"),
                askUpdate = $("#searchSelectQuoteRealTimeAsk"),
                bidUpdate = $("#searchSelectQuoteRealTimeBid");

            updateQuote(symbol, askUpdate, bidUpdate, volumeUpdate, $("#askArrow"), $("#bidArrow"));
        }
    }, 1000);

    $("#histrySearch").validate({
        rules: {
            endDateSearch: {
                required: true,
                date: true
            },
            endDateSearch: {
                required: true,
                date: true
            }
        }
    });

    $("#historyMyQuote").validate({
        rules: {
            endDate: {
                required: true,
                date: true
            },
            startDate: {
                required: true,
                date: true
            }
        }
    });


    $("#btnUpdateHistory").click(function () {
        var myQuoteSymbol = $('#myQuoteSymbol').text();
        var start = $('#startDate').val();
        var end = $('#endDate').val();

        var inputURL = "http://query.yahooapis.com/v1/public/yql" +
            "?q=select%20*%20from%20yahoo.finance.historicaldata%20" +
            "where%20symbol%20%3D%20%22"
            + myQuoteSymbol + "%22%20and%20startDate%20%3D%20%22"
            + start + "%22%20and%20endDate%20%3D%20%22"
            + end + "%22&format=json&env=store%3A%2F%2F"
            + "datatables.org%2Falltableswithkeys";

        d3.json(inputURL, function (error, data) {
            console.log(data);
            data.query.results.quote.forEach(function (d) {
                d.date = parseDate(d.Date);
                d.high = +d.High;
                d.low = +d.Low;
            });

            x.domain(d3.extent(data.query.results.quote, function (d) {
                return d.date;
            }));
            y.domain([
                d3.min(data.query.results.quote, function (d) {
                    return d.low;
                }),
                d3.max(data.query.results.quote, function (d) {
                    return d.high;
                })
            ]);
            var elem = d3.select("#myQuoteHistory").transition();
            elem.select(".line")
                .duration(750)
                .attr("d", valueline(data.query.results.quote));

            elem.select(".x.axis")
                .duration(750)
                .call(xAxis);
            elem.select(".y.axis")
                .duration(750)
                .call(yAxis);
        });
    });

    $("#btnUpdateHistorySearch").click(function () {
        var myQuoteSymbol = $('#searchSelectQuoteSymbol').text();
        var start = $('#startDateSearch').val();
        var end = $('#endDateSearch').val();

        var inputURL = "http://query.yahooapis.com/v1/public/yql" +
            "?q=select%20*%20from%20yahoo.finance.historicaldata%20" +
            "where%20symbol%20%3D%20%22"
            + myQuoteSymbol + "%22%20and%20startDate%20%3D%20%22"
            + start + "%22%20and%20endDate%20%3D%20%22"
            + end + "%22&format=json&env=store%3A%2F%2F"
            + "datatables.org%2Falltableswithkeys";

        d3.json(inputURL, function (error, data) {
            console.log(data);
            data.query.results.quote.forEach(function (d) {
                d.date = parseDate(d.Date);
                d.high = +d.High;
                d.low = +d.Low;
            });

            x.domain(d3.extent(data.query.results.quote, function (d) {
                return d.date;
            }));
            y.domain([
                d3.min(data.query.results.quote, function (d) {
                    return d.low;
                }),
                d3.max(data.query.results.quote, function (d) {
                    return d.high;
                })
            ]);
            var elem = d3.select("#myQuoteHistorySearch").transition();
            elem.select(".line")
                .duration(750)
                .attr("d", valueline(data.query.results.quote));

            elem.select(".x.axis")
                .duration(750)
                .call(xAxis);
            elem.select(".y.axis")
                .duration(750)
                .call(yAxis);
        });
    });
});

function updateQuote( symbol, askUpdate, bidUpdate, volumeUpdate, arrowAsk, arrowBid ) {
    var oldAsk = parseFloat(askUpdate.text()).toFixed(2),
        oldBid = parseFloat(bidUpdate.text()).toFixed(2);
    $.get( "/Dashboard/GetRateUpdates", { symbol: symbol },
        function ( data ) {
            if ( data !== null ) {
                var currentAsk = parseFloat(data.Ask),
                    currentBid = parseFloat(data.Bid);
                volumeUpdate.text( data.Volume );
                askUpdate.text( currentAsk.toFixed(2) );
                bidUpdate.text( currentBid.toFixed(2) );
                changeArrowRisingFalling( arrowAsk, currentAsk, oldAsk );
                changeArrowRisingFalling( arrowBid, currentBid, oldBid );
            }
        } );
}

function changeArrowRisingFalling( elem, currVal, oldVal ) {
    if ( currVal > oldVal ) {
        elem.removeClass( "glyphicon-arrow-down" ).addClass( "glyphicon-arrow-up" );
        elem.css( "color", "green" );
    } else if ( currVal < oldVal ) {
        elem.removeClass( "glyphicon-arrow-up" ).addClass( "glyphicon-arrow-down" );
        elem.css( "color", "red" );
    }
}

function updateModal( modal, currentRateElem, symbol, operation, arrow,
    amountToPay, currentBalance, amountShares, actionButton,
    currentBalanceElem, balanceArrow, aquireSharesPrice ) {
    if ( modal.is( ":visible" ) ) {
        var oldRate = parseFloat( currentRateElem.text() ).toFixed( 2 );
        $.get( "/Dashboard/GetRateUpdates", { symbol: symbol },
            function ( data ) {
                if ( data !== null ) {
                    var newRate = null;
                    if ( operation === "Ask" ) {
                        newRate = parseFloat( data.Ask );
                    } else if ( operation === "Bid" ) {
                        newRate = parseFloat( data.Bid );
                    }
                    currentRateElem.text( newRate.toFixed( 2 ) );

                    changeArrowRisingFalling( arrow, newRate, oldRate );
                    updateAmountToPay( amountToPay, currentBalance, amountShares, newRate, actionButton, aquireSharesPrice );
                }
            });

        var oldValue = parseFloat( currentBalanceElem.text() );
        $.get( "/Dashboard/GetCurrentBalance", "",
            function ( data ) {
                var currentValue = parseFloat( data );
                changeArrowRisingFalling( balanceArrow, currentValue, oldValue );
                currentBalanceElem.text( currentValue.toFixed( 2 ) );
            });
    }
    return false;
}

function updateAmountToPay( amounToPayElem, currentBalance, shares,
    currentRate, actionButton, aquireSharesPrice ) {
    var requiredToPay = parseFloat( shares * currentRate );
    if ( requiredToPay > currentBalance ) {
        actionButton.prop( 'disabled', true );
    } else {
        actionButton.prop( 'disabled', false );
    }
    var value = requiredToPay.toFixed( 2 );
    if ( isNaN( value ) ) {
        actionButton.prop( 'disabled', true );
        value = "0.00";
    } else {
        actionButton.prop( 'disabled', false );
    }
    aquireSharesPrice.val( value );
    amounToPayElem.text( value );
}

function moreInfoTable(quote, tableOne, tableTwo) {
    for (var j = 0; j < 4; j++) {
        var row = $("<tr rowspan='2'></tr>"),
            dataOne = $("<td></td>"),
            dataTwo = $("<td></td>");
        if (j === 0) {
            dataOne.text("Last Trade: ");
            dataTwo.html(quote.LastTradeDate
                + " "
                + quote.LastTradeWithTime);
        } else if (j === 1) {
            dataOne.text("Day's High: ");
            dataTwo.text(quote.DaysHigh);
        } else if (j === 2) {
            dataOne.text("Day's Low: ");
            dataTwo.text(quote.DaysLow);
        } else {
            dataOne.text("Change: ");
            dataTwo.text("(" + quote.Change
                + ") ("
                + quote.PercentChange + ")");
        }
        row.append(dataOne);
        row.append(dataTwo);
        tableOne.append(row);

        row = $("<tr rowspan='2'></tr>");
        dataOne = $("<td></td>");
        dataTwo = $("<td></td>");

        if (j === 0) {
            dataOne.text("Year High: ");
            dataTwo.text(quote.YearHigh);
        } else if (j === 1) {
            dataOne.text("Year Low: ");
            dataTwo.text(quote.YearLow);
        } else if (j === 2) {
            dataOne.text("Change From Year High: ");
            dataTwo.text("(" + quote.ChangeFromYearHigh
                + ") or ("
                + quote.PercebtChangeFromYearHigh + ")");
        } else {
            dataOne.text("Change From Year Low: ");
            dataTwo.text("(" + quote.ChangeFromYearLow
                 + ") or ("
                 + quote.PercentChangeFromYearLow + ")");
        }
        row.append(dataOne);
        row.append(dataTwo);
        tableTwo.append(row);
    }
}

function graphInit(elem, myQuoteSymbol) {//d3.select("#myQuoteHistory")
    var margin = { top: 30, right: 50, bottom: 30, left: 50 },
        width = 600 - margin.left - margin.right,
        height = 330 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    var xGrid = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
        .tickSize(-height, 0, 0)
        .tickFormat("");

    var yGrid = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat("");

    var valueline = d3.svg.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.high); });
    var svg = elem
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate("
                + margin.left
                + "," + margin.top + ")");

    var inputURL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22" +
        myQuoteSymbol + "%22%20and%20startDate%20%3D%20%22" +
        "2015-01-01" + "%22%20and%20endDate%20%3D%20%22" +
        "2015-04-28" + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

    d3.json(inputURL, function (error, data) {

        data.query.results.quote.forEach(function (d) {
            d.date = parseDate(d.Date);
            d.high = +d.High;
            d.low = +d.Low;
        });

        x.domain(d3.extent(data.query.results.quote, function (d) {
            return d.date;
        }));
        y.domain([
            d3.min(data.query.results.quote, function (d) { return d.low; }),
            d3.max(data.query.results.quote, function (d) { return d.high; })
        ]);

        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data.query.results.quote));

        svg.append("g") 
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")           
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(xGrid);

        svg.append("g")
            .attr("class", "grid")
            .call(yGrid);

    });
}

var YAHOO = {
    Finance: {
        SymbolSuggest: {}
    }
};