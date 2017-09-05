using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Project.Models
{
    public class YahooResponse
    {
        public Query Query { get; set; }
    }

    public class Query
    {
        public int Count { get; set; }

        public DateTime Created { get; set; }

        public string Lang { get; set; }

        public Results Results { get; set; }
    }

    public class Results
    {
        public Results()
        {
            this.Quote = new List<Quote>();
        }
        public List<Quote> Quote { get; set; }
    }

    public class Quote
    {
        public string Symbol { get; set; }

        public string Ask { get; set; }

        public string Bid { get; set; }

        public string Name { get; set; }

        public string Change { get; set; }

        public string PercentChange { get; set; }

        public string LastTradeDate { get; set; }

        public string DaysLow { get; set; }

        public string DaysHigh { get; set; }

        public string YearLow { get; set; }

        public string YearHigh { get; set; }

        public string ChangeFromYearLow { get; set; }

        public string PercentChangeFromYearLow { get; set; }

        public string ChangeFromYearHigh { get; set; }

        public string PercebtChangeFromYearHigh { get; set; }

        public string LastTradeWithTime { get; set; }

        public string Volume { get; set; }

        public string Currency { get; set; }
    }

    public class Rss
    {
        public Channel Channel { get; set; }
    }

    public class Channel
    {
        public Channel() {
            this.Items = new List<Item>();
        }
        public Image Image { get; set; }

        public List<Item> Items { get; set; }
    }

    public class Image
    {
        public string Url { get; set; }

        public string Link { get; set; }

        public string Title { get; set; }

        public string Width { get; set; }

        public string Height { get; set; }
    }

    public class Item
    {
        public string Title { get; set; }
        public string Link { get; set; }
        public string Description { get; set; }
        public string PubDate { get; set; }
    }

    public class QuoteInfo
    {
        public Quote Quote { get; set; }
        public Channel Channel { get; set; }
    }


    //Update

    public class YahooUpadate
    {
        public QueryUpdate Query { get; set; }
    }

    public class QueryUpdate
    {
        public int Count { get; set; }

        public DateTime Created { get; set; }

        public string Lang { get; set; }

        public ResultsUpdate Results { get; set; }
    }

    public class ResultsUpdate
    {
        public ResultsUpdate()
        {
            this.Quote = new List<QuoteUpdate>();
        }
        public List<QuoteUpdate> Quote { get; set; }
    }

    public class QuoteUpdate
    {
        public string Ask { get; set; }

        public string Bid { get; set; }

        public string Volume { get; set; }

        public string Currency { get; set; }
    }

}