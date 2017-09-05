using Project.Models;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using System.Threading.Tasks;
using WebSite.Models;
using System.Web.UI;

namespace Project.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private string getServerUrl = "https://query.yahooapis.com/";
        private string getQuoteQueryStart = "v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22";
        private string getQuoteQueryEnd = "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public DashboardController() { }

        public DashboardController(ApplicationUserManager userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        [OutputCache(Duration = 60, VaryByParam = "none")]
        public ActionResult Index()
        {
            var model = GetUserDashboard();
            return View(model);
        }

        public ActionResult GetStockAndBalanceUpdate()
        {
            var userId = User.Identity.GetUserId();

            var model = new UserStockAndBalanceUpdate
            {
                Balance = UserManager.FindById(userId).Balance,
                Profit = GetProfit(),
                Invested = GetAmountInvested()
            };
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CollectStock(string stockId)
        {
            var userId = User.Identity.GetUserId();
            ApplicationUser user = UserManager.FindById(userId);
            Stock stock = user.MyStocks.Where(s => s.StockID == int.Parse(stockId)).FirstOrDefault();

            RestClient client = new RestClient("https://query.yahooapis.com/");
            RestRequest request = new RestRequest(
                "v1/public/yql?q=select%20Bid%2C%20Ask%2C%20Volume%2C%20Currency%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22"
                + stock.StockSymbol
                + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=");
            var quote = client.Execute<YahooUpadate>(request).Data;
            decimal profit = 0;
            if (quote != null)
            {
                if (quote.Query != null)
                {
                    if (quote.Query.Count > 0)
                    {
                        var result = quote.Query;
                        if (stock.isBuyOrSell)
                        {
                            profit = stock.StockShares * (Decimal.Parse(result.Results.Quote.First().Ask));
                        }
                        else
                        {
                            profit = ((stock.StockShares * (Decimal.Parse(result.Results.Quote.First().Bid))) * -1);
                        }
                    }
                }
            }
            user.Balance += profit;
            user.MyStocks.Remove(stock);
            IdentityResult r = UserManager.Update(user);
            if (r.Succeeded)
            {
                return Json(true);
            }
            else
            {
                return Json(false);
            }
            
        }

        private UserStockAndBalance GetUserDashboard()
        {
            var userId = User.Identity.GetUserId();
            ApplicationUser user = UserManager.FindById(userId);
            List<Stock> stocks = user.MyStocks.ToList();
            List<Friends> friends = user.MyFriends.ToList();

            List<MyQuote> myQuotes = new List<MyQuote>();

            foreach (Stock stock in stocks)
            {
                RestClient client = new RestClient(getServerUrl);
                RestRequest request = new RestRequest(getQuoteQueryStart + stock.StockSymbol + getQuoteQueryEnd);
                var query = client.Execute<YahooResponse>(request);
                Quote quote = new Quote();
                if (query.Data != null)
                {
                    if (query.Data.Query.Count > 0)
                    {
                        quote = query.Data.Query.Results.Quote.First();
                    }
                }

                client = new RestClient("http://feeds.finance.yahoo.com/");
                request = new RestRequest("rss/2.0/headline?s=" + quote.Symbol + "&region=US&lang=en-US");
                var rss = client.Execute<Rss>(request);
                MyQuote myQuote = new MyQuote
                {
                    QuoteId = stock.StockID,
                    Ask = (quote.Ask != null) ? Decimal.Parse(quote.Ask) : 0,
                    Bid = (quote.Bid != null) ? Decimal.Parse(quote.Bid) : 0,
                    Symbol = stock.StockSymbol,
                    Name = stock.StockName,
                    Change = quote.Change,
                    PercentChange = quote.PercentChange,
                    LastTradeDate = quote.LastTradeDate,
                    DaysHigh = (quote.DaysHigh != null) ? Decimal.Parse(quote.DaysHigh) : 0,
                    DaysLow = (quote.DaysLow != null) ? Decimal.Parse(quote.DaysLow) : 0,
                    YearHigh = (quote.YearHigh != null) ? Decimal.Parse(quote.YearHigh) : 0,
                    YearLow = (quote.YearLow != null) ? Decimal.Parse(quote.YearLow) : 0,
                    ChangeFromYearHigh = quote.ChangeFromYearHigh,
                    ChangeFromYearLow = quote.ChangeFromYearLow,
                    PercebtChangeFromYearHigh = quote.PercebtChangeFromYearHigh,
                    PercentChangeFromYearLow = quote.PercentChangeFromYearLow,
                    LastTradeWithTime = quote.LastTradeWithTime,
                    Volume = (quote.Volume != null) ? long.Parse(quote.Volume) : 0,
                    Currency = quote.Currency,
                    StockPrice = stock.StockPrice,
                    StockShares = stock.StockShares,
                    TradeDate = stock.TradeDate,
                    IsBuyOrSell = stock.isBuyOrSell,
                    Channel = rss.Data.Channel
                };
                myQuotes.Add(myQuote);
            }
            List<MyFriend> myFriends = new List<MyFriend>();
            if (friends.Count > 0)
            {
                foreach (Friends f in friends)
                {
                    ApplicationUser friend = UserManager.FindById(f.SecondUserId);
                    myFriends.Add(new MyFriend
                    {
                        Id = friend.Id,
                        FirstName = friend.FirstName,
                        LastName = friend.LastName,
                        UserName = friend.UserName,
                        Email = friend.Email
                    });
                }
            }

            var model = new UserStockAndBalance
            {
                Balance = UserManager.FindById(userId).Balance,
                Profit = GetProfit(),
                Invested = GetAmountInvested(),
                MyQuotes = myQuotes,
                MyFriends = myFriends
            };
            return model;
        }

        [OutputCache(Duration = 60, VaryByParam = "none", Location = OutputCacheLocation.Client, NoStore = true)]
        public ActionResult GetQuoteBySymbol(string symbol)
        {
            RestClient client = new RestClient(getServerUrl);
            RestRequest request = new RestRequest(getQuoteQueryStart + symbol + getQuoteQueryEnd);
            var quote = client.Execute<YahooResponse>(request);

            client = new RestClient("http://feeds.finance.yahoo.com/");
            request = new RestRequest("rss/2.0/headline?s=" + symbol.ToLower() + "&region=US&lang=en-US");
            var rss = client.Execute<Rss>(request);

            QuoteInfo quoteInfo = new QuoteInfo
            {
                Channel = rss.Data.Channel,
                Quote = quote.Data.Query.Results.Quote.First()
            };

            return Json(quoteInfo, JsonRequestBehavior.AllowGet);
        }

        public ActionResult AddFriend(string id)
        {
            ApplicationUser friend = UserManager.FindById(id);
            var userId = User.Identity.GetUserId();
            ApplicationUser me = UserManager.FindById(userId);
            bool alreadyFriends = false;
            foreach (Friends f in me.MyFriends)
            {
                if (f.SecondUserId == id)
                {
                    alreadyFriends = true;
                    break;
                }
            }
            if (alreadyFriends == false)
            {
                me.MyFriends.Add(new Friends
                {
                    FirstUser = me,
                    FirstUserId = me.Id,
                    SecondUserId = friend.Id,
                    SecondUser = friend
                });
            }
            IdentityResult r = UserManager.Update(me);
            IdentityResult rt = UserManager.Update(friend);
            if (r.Succeeded && rt.Succeeded)
            {
                return Json(new MyFriend
                    {
                        Id = friend.Id,
                        FirstName = friend.FirstName,
                        LastName = friend.LastName,
                        UserName = friend.UserName,
                        Email = friend.Email
                    }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }

        }

        [OutputCache(Duration = 60, VaryByParam = "none")]
        public ActionResult FindFriend(string userName)
        {
            ApplicationUser friend = UserManager.FindByName(userName);
            MyFriend myFriend = new MyFriend();
            if (friend != null)
            {
                myFriend = new MyFriend
                {
                    Id = friend.Id,
                    FirstName = friend.FirstName,
                    LastName = friend.LastName,
                    UserName = friend.UserName,
                    Email = friend.Email
                };
                return Json(myFriend, JsonRequestBehavior.AllowGet);
            }
            return Json(false, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult AquireStock(AquireStockViewModel model)
        {
            MyQuote myQuote = new MyQuote();
            if (model != null)
            {

                var userId = User.Identity.GetUserId();
                ApplicationUser user = UserManager.FindById(userId);
                user.Balance = user.Balance - Decimal.Parse(model.aquireSharesPrice);
                Stock stock = new Stock
                {
                    StockName = model.aquireSharesName,
                    StockSymbol = model.aquireSharesSymbol,
                    isBuyOrSell = (model.aquireSharesIsBuyOrSell.Equals("Ask")),
                    StockPrice = Decimal.Parse(model.aquireSharesPrice),
                    TradeDate = DateTime.Now,
                    StockShares = int.Parse(model.aquireSharesNumber)
                };
                user.MyStocks.Add(stock);
                UserManager.Update(user);

                RestClient client = new RestClient(getServerUrl);
                RestRequest request = new RestRequest(getQuoteQueryStart + stock.StockSymbol + getQuoteQueryEnd);
                var query = client.Execute<YahooResponse>(request);
                Quote quote = new Quote();
                if (query.Data != null)
                {
                    if (query.Data.Query.Count > 0)
                    {
                        quote = query.Data.Query.Results.Quote.First();
                    }
                }

                client = new RestClient("http://feeds.finance.yahoo.com/");
                request = new RestRequest("rss/2.0/headline?s=" + quote.Symbol + "&region=US&lang=en-US");
                var rss = client.Execute<Rss>(request);
                myQuote = new MyQuote
                {
                    QuoteId = stock.StockID,
                    Ask = (quote.Ask != null) ? Decimal.Parse(quote.Ask) : 0,
                    Bid = (quote.Bid != null) ? Decimal.Parse(quote.Bid) : 0,
                    Symbol = stock.StockSymbol,
                    Name = stock.StockName,
                    Change = quote.Change,
                    PercentChange = quote.PercentChange,
                    LastTradeDate = quote.LastTradeDate,
                    DaysHigh = (quote.DaysHigh != null) ? Decimal.Parse(quote.DaysHigh) : 0,
                    DaysLow = (quote.DaysLow != null) ? Decimal.Parse(quote.DaysLow) : 0,
                    YearHigh = (quote.YearHigh != null) ? Decimal.Parse(quote.YearHigh) : 0,
                    YearLow = (quote.YearLow != null) ? Decimal.Parse(quote.YearLow) : 0,
                    ChangeFromYearHigh = quote.ChangeFromYearHigh,
                    ChangeFromYearLow = quote.ChangeFromYearLow,
                    PercebtChangeFromYearHigh = quote.PercebtChangeFromYearHigh,
                    PercentChangeFromYearLow = quote.PercentChangeFromYearLow,
                    LastTradeWithTime = quote.LastTradeWithTime,
                    Volume = (quote.Volume != null) ? long.Parse(quote.Volume) : 0,
                    Currency = quote.Currency,
                    StockPrice = stock.StockPrice,
                    StockShares = stock.StockShares,
                    TradeDate = stock.TradeDate,
                    IsBuyOrSell = stock.isBuyOrSell,
                    Channel = rss.Data.Channel
                };
            }
            return Json(myQuote);
        }

        private decimal GetProfit()
        {
            var userId = User.Identity.GetUserId();
            ApplicationUser user = UserManager.FindById(userId);
            decimal profit = 0;
            foreach (Stock stock in user.MyStocks)
            {
                RestClient client = new RestClient("https://query.yahooapis.com/");
                RestRequest request = new RestRequest(
                    "v1/public/yql?q=select%20Bid%2C%20Ask%2C%20Volume%2C%20Currency%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22"
                    + stock.StockSymbol
                    + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=");
                var quote = client.Execute<YahooUpadate>(request).Data;
                if (quote != null)
                {
                    if (quote.Query != null)
                    {
                        if (quote.Query.Count > 0)
                        {
                            var result = quote.Query;
                            if (stock.isBuyOrSell)
                            {
                                profit += (result.Results.Quote.First().Ask != null) ? (stock.StockShares * (Decimal.Parse(result.Results.Quote.First().Ask)) - stock.StockPrice) : 0;
                            }
                            else
                            {
                                profit += (result.Results.Quote.First().Bid != null) ? ((stock.StockShares * (Decimal.Parse(result.Results.Quote.First().Bid)) - stock.StockPrice) * -1) : 0;
                            }
                        }
                    }
                    else
                    {
                        break;
                    }
                }
                else { break; }

            }
            return profit;
        }

        private decimal GetAmountInvested()
        {
            var userId = User.Identity.GetUserId();
            ApplicationUser user = UserManager.FindById(userId);
            decimal invested = 0;
            foreach (Stock stock in user.MyStocks)
            {
                invested += stock.StockPrice;
            }
            return invested;
        }


        public ActionResult GetCurrentBalance()
        {
            return Content(UserManager.FindById(User.Identity.GetUserId()).Balance.ToString());
        }

        public ActionResult GetRateUpdates(string symbol)
        {
            RestClient client = new RestClient("https://query.yahooapis.com/");
            RestRequest request = new RestRequest(
                "v1/public/yql?q=select%20Bid%2C%20Ask%2C%20Volume%2C%20Currency%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22"
                + symbol
                + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=");
            var quote = client.Execute<YahooUpadate>(request);
            if (quote.Data != null)
            {
                if (quote.Data.Query != null)
                {
                    if (quote.Data.Query.Count > 0)
                    {
                        return Json(quote.Data.Query.Results.Quote.First(), JsonRequestBehavior.AllowGet);
                    }
                }
            }
            return Json(null, JsonRequestBehavior.AllowGet);
        }
    }
}
