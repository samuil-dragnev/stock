using Project.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace WebSite.Models
{
    public class Stock
    {
        public int StockID { get; set; }

        public String StockName { get; set; }

        public String StockSymbol { get; set; }

        [DataType(DataType.Currency)]
        public decimal StockPrice { get; set; }

        public bool isBuyOrSell { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime TradeDate { get; set; }

        public int StockShares { get; set; }

        [StringLength(128), MinLength(3)]
        [ForeignKey("AspNetUser")]
        public virtual string AspNetUserId { get; set; }


        public virtual ApplicationUser AspNetUser { get; set; }
    }

    public class Friends
    {
        [Key]
        public int FriendsId { get; set; }

        [StringLength(128), MinLength(3)]
        [ForeignKey("FirstUser")]
        public virtual string FirstUserId { get; set; }
        public virtual ApplicationUser FirstUser { get; set; }

        [StringLength(128), MinLength(3)]
        [ForeignKey("SecondUser")]
        public virtual string SecondUserId { get; set; }
        public virtual ApplicationUser SecondUser { get; set; }
    }

    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }

        public bool IsDepositOrWithDraw { get; set; }

        public decimal Amount { get; set; }

        public decimal BalanceBefore { get; set; }

        public decimal BalanceAfter { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime DateOfTransaction { get; set; }

        [StringLength(128), MinLength(3)]
        [ForeignKey("User")]
        public virtual string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }
    }
}
