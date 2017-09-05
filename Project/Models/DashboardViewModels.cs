using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebSite.Models;

namespace Project.Models
{
    public class UserStockAndBalance
    {
        public decimal Balance { get; set; }

        public decimal Profit { get; set; }

        public decimal Invested { get; set; }

        public List<MyQuote> MyQuotes { get; set; }

        public List<MyFriend> MyFriends { get; set; }
    }

    public class UserStockCollect
    {
        public decimal Profit { get; set; }
        public decimal Invested { get; set; }
    }

    public class MyFriend
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
    }

    public class UserStockAndBalanceUpdate
    {
        public decimal Balance { get; set; }

        public decimal Profit { get; set; }

        public decimal Invested { get; set; }
    }


    public class AquireStockViewModel {
        public string aquireSharesNumber { get; set; }

        public string aquireSharesName { get; set; }

        public string aquireSharesSymbol { get; set; }

        public string aquireSharesPrice { get; set; }

        public string aquireSharesIsBuyOrSell { get; set; }
    }


    public class MyQuote
    {
        public int QuoteId { get; set; }

        public string Symbol { get; set; }

        public decimal Ask { get; set; }

        public decimal Bid { get; set; }

        public string Name { get; set; }

        public string Change { get; set; }

        public string PercentChange { get; set; }

        public string LastTradeDate { get; set; }

        public decimal DaysLow { get; set; }

        public decimal DaysHigh { get; set; }

        public decimal YearLow { get; set; }

        public decimal YearHigh { get; set; }

        public string ChangeFromYearLow { get; set; }

        public string PercentChangeFromYearLow { get; set; }

        public string ChangeFromYearHigh { get; set; }

        public string PercebtChangeFromYearHigh { get; set; }

        public string LastTradeWithTime { get; set; }

        public long Volume { get; set; }

        public string Currency { get; set; }

        [DataType(DataType.Currency)]
        public decimal StockPrice { get; set; }
        public bool IsBuyOrSell { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime TradeDate { get; set; }

        public int StockShares { get; set; }

        public Channel Channel { get; set; }
    }
}