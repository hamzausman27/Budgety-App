 var budgetController = (function () {

     var Expense = function (id, description, value) {
         this.id = id;
         this.description = description;
         this.value = value;
         this.percentage = -1;
     };

     Expense.prototype.calPercentage = function (totalIncome) {
         if (totalIncome > 0) {

             this.percentage = Math.round((this.value / totalIncome) * 100);

         } else {
             this.percentage = -1;
         }

     };
     Expense.prototype.getPercentage = function () {
         return this.percentage;
     };

     var Income = function (id, description, value) {
         this.id = id;
         this.description = description;
         this.value = value;
     };
     var data = {
         allItems: {
             exp: [],
             inc: []
         },
         totals: {
             exp: 0,
             inc: 0
         },
         budget: 0,
         percentage: -1
     };
     var calculateTotal = function (type) {
         var sum = 0;
         data.allItems[type].forEach(function (curr) {
             sum = sum + curr.value;
         });
         data.totals[type] = sum;
     };

     return {
         addItem: function (type, desc, value) {
             var newItem, ID;
             //Create new id 
             if (data.allItems[type].length > 0) {
                 ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
             } else {
                 ID = 0;
             }

             //Create new item
             if (type === 'exp') {
                 newItem = new Expense(ID, desc, value);
             } else if (type === 'inc') {
                 newItem = new Income(ID, desc, value);
             }
             //Add new item to the data 
             data.allItems[type].push(newItem);
             return newItem;

         },

         deleteItem: function (type, id) {
             var ids, index;
             // console.log(data.allItems[type]);
             ids = data.allItems[type].map(function (current) {
                 return current.id;
             });
             // console.log(ids);

             index = ids.indexOf(id);

             if (index !== -1) {
                 data.allItems[type].splice(index, 1);
             }


         },
         calculateBudget: function () {
             calculateTotal('exp');
             calculateTotal('inc');

             data.budget = data.totals.inc - data.totals.exp;
             if (data.totals.inc > 0) {
                 data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);


             }

         },
         getBudget: function () {
             return {
                 budget: data.budget,
                 totalinc: data.totals.inc,
                 totalexp: data.totals.exp,
                 percentage: data.percentage
             }
         },
         calculatePercentages: function () {


             data.allItems.exp.forEach(function (cur) {
                 cur.calPercentage(data.totals.inc);
             });
         },


         getPercentages: function () {
             var allPerc = data.allItems.exp.map(function (cur) {
                 return cur.getPercentage();
             });
             return allPerc;
         }
     };


 })();

 var UIController = (function () {
     //some code heree
     var DOMstrings = {
         inputType: '.add__type',
         inputDescription: '.add__description',
         inputValue: '.add__value',
         inputButton: '.add__btn',
         incomeContainer: '.income__list',
         expenseContainer: '.expenses__list',
         budgetLabel: '.budget__value',
         incomeLabel: '.budget__income--value',
         expensesLabel: '.budget__expenses--value',
         percentageLabel: '.budget__expenses--percentage',
         container: '.container',
         expensePercentageLabel: '.item__percentage',
         dateLabel: '.budget__title--month'
     };
     var formatNumber = function (num, type) {
         var numSplit, int, dec, type, pattern;
         /*
                    + or - before number
                    exactly 2 decimal points
                    comma separating the thousands
        
                    2310.4567 -> + 2,310.46
                    2000 -> + 2,000.00
                    */

         num = Math.abs(num);
         num = num.toFixed(2);

         numSplit = num.split('.');

         int = numSplit[0];


         pattern = /(-?\d+)(\d{3})/;
         while (pattern.test(int)) {
             int = int.replace(pattern, "$1,$2");
         }




         dec = numSplit[1];

         return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

     };

     var NodeListForEach = function (list, callback) {
         for (var i = 0; i < list.length; i++) {
             callback(list[i], i);
         }
     };

     return {
         getInput: function () {
             return {

                 type: document.querySelector(DOMstrings.inputType).value,
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
             };
         },

         additemList: function (obj, type) {
             var html, newHtml, element;
             //create html string with placeholder text
             if (type === 'inc') {
                 element = DOMstrings.incomeContainer;
                 html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
             } else if (type === 'exp') {
                 element = DOMstrings.expenseContainer;
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
             }
             // Replace the placeholder text

             newHtml = html.replace('%id%', obj.id);
             newHtml = newHtml.replace('%description%', obj.description);
             newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

             // Insert the HTML into the DOM
             document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
         },
         deleteListItem: function (selectorID) {
             var el;
             el = document.getElementById(selectorID);
             el.parentNode.removeChild(el);

         },

         clearFields: function () {
             var fields, fieldsArr;
             fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

             fieldsArr = Array.prototype.slice.call(fields);

             fieldsArr.forEach(function (current, index, array) {
                 current.value = "";
             });

             fieldsArr[0].focus();

         },
         displayBudget: function (obj) {
             var type;
             obj.budget > 0 ? type = 'inc' : type = 'exp';
             if (obj.budget > 0) {
                 document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
             } else {
                 document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
             }



             if (obj.totalinc > 0) {
                 document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalinc, 'inc');
             } else {
                 document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalinc;
             }
             if (obj.totalexp > 0) {
                 document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalexp, 'exp');
             } else {
                 document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalexp;
             }

             if (obj.totalexp <= obj.totalinc) {
                 document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
             } else {
                 document.querySelector(DOMstrings.percentageLabel).textContent = '---';
             }



         },
         displayPercentages: function (percentages) {
             var fields;

             fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);


             NodeListForEach(fields, function (current, index) {
                 if (percentages[index] > 0) {
                     current.textContent = percentages[index] + '%';
                 } else {
                     current.textContent = '---';
                 }

             });


         },
         displayDate: function () {
             var now, year, month;
             now = new Date();
             year = now.getFullYear();
             month = now.getMonth();
             var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
             document.querySelector(DOMstrings.dateLabel).textContent = months[month - 1] + ' of ' + year;
         },
         changeType: function () {

             var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);


             NodeListForEach(fields, function (curr) {
                 curr.classList.toggle('red-focus');
             });

             document.querySelector(DOMstrings.inputButton).classList.toggle('red');
         },

         getDOMStrings: function () {

             return DOMstrings;
         }
     };



 })();


 var Controller = (function (budgetCtrl, UICtrl) {

     var setupEventListeners = function () {

         var DOMstrings = UICtrl.getDOMStrings();

         document.querySelector(DOMstrings.inputButton).addEventListener('click', ctrlAddItem);

         document.addEventListener('keypress', function (event) {

                 if (event.keyCode === 13 || event.which === 13) {
                     ctrlAddItem();
                 }
             }

         );
         document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);
         document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changeType)

     };
     var updateBudget = function () {
         //   1. Calculate the budget
         budgetCtrl.calculateBudget();
         // 2. Return the budget
         var budget = budgetCtrl.getBudget();

         //3. Display the budget on the UI
         // console.log(budget);
         UICtrl.displayBudget(budget);
     };

     var updatePercentage = function () {
         //1. Calculate the percentages
         budgetCtrl.calculatePercentages();

         //2. Read percentage from budget controller
         var percentages = budgetCtrl.getPercentages();


         //3. Update the UI with new prcentages
         UICtrl.displayPercentages(percentages);

     };

     var ctrlAddItem = function () {
         //  console.log('It works!');
         //1. Get data from input fieldss
         var input = UICtrl.getInput();
         if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

             //2. Add the item to the budget controller
             var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

             //3. Add the item to UI
             UICtrl.additemList(newItem, input.type);


             //3.1 clear text fields
             UICtrl.clearFields();

             //4. Calculate and update the budget

             updateBudget();
             //5. Calculate and update the percentages

             updatePercentage();

         }

     };

     var ctrlDeleteItem = function (event) {

         var itemID, splitID, type, ID;
         itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

         if (itemID) {

             splitID = itemID.split('-');
             type = splitID[0];
             ID = parseInt(splitID[1]);

             //1. Delete the item from datastructure
             budgetCtrl.deleteItem(type, ID);

             //2. Delete the item from UI
             UICtrl.deleteListItem(itemID);

             //3. Updata and show the new budget
             updateBudget();

             //4. Calculate and update the percentages

             updatePercentage();
         }






     }

     return {
         init: function () {

             console.log('Application has started!');
             UICtrl.displayBudget({
                 budget: 0,
                 totalinc: 0,
                 totalexp: 0,
                 percentage: 0
             });
             UICtrl.displayDate();
             setupEventListeners();
         }
     };

 })(budgetController, UIController);
 Controller.init();