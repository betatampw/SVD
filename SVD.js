var fs = require('fs');



SVDModel = function(arParams) {
  this.dataSetBase = [];
  this.dataSetMatrix = {};

  this.features = 2;
  this.lambda = 0.2;
  this.eta = 0.1;
  this.mu = 0;

  this.maxUserIndex = 0;
  this.maxItemIndex = 0;
  this.ratingCount = 0;

  this.usersBasePredictor = {};
  this.itemsBasePredictor = {};

  this.usersFeatureVectors = {};
  this.itemsFeatureVectors = {};

  this.iterationNumber = 0;
  this.error = 0;
  this.rmse = 1;
  this.rmseOld = 0;
  this.threshold = 0.01;

  if ('object' == typeof(arParams)) {
    if (arParams.lambda) {
      this.lambda = arParams.lambda;
    }
    if (arParams.features) {
      this.features = arParams.features;
    }
    if (arParams.dataSetBase) {
      this.dataSetBase = arParams.dataSetBase;
    } else {
      throw "dataSetBase not determined";
    }
  }
  this.Init();
}

SVDModel.prototype.Init = function() {
  for (var i = this.dataSetBase.length - 1; i >= 0; i--) {
    if (!this.dataSetMatrix[this.dataSetBase[i][0]]) {
      this.dataSetMatrix[this.dataSetBase[i][0]] = {};
    }
    this.dataSetMatrix[this.dataSetBase[i][0]][this.dataSetBase[i][1]] = this.dataSetBase[i][2];


    if (parseInt(this.dataSetBase[i][0]) > this.maxUserIndex)
      this.maxUserIndex = parseInt(this.dataSetBase[i][0]);

    if (parseInt(this.dataSetBase[i][1]) > this.maxItemIndex)
      this.maxItemIndex = parseInt(this.dataSetBase[i][1]);

    this.ratingCount++
  };

  console.log('Read ' + this.maxUserIndex + ' users and ' + this.maxItemIndex + ' items')

  for (var u = 1; u <= this.maxUserIndex; u++) {
    this.usersBasePredictor[u] = 0;
    for (var f = 0; f < this.features; f++) {
      if (!this.usersFeatureVectors[u]) {
        this.usersFeatureVectors[u] = [];
      }
      this.usersFeatureVectors[u].push(0.1);
    };
  }

  for (var i = 1; i <= this.maxItemIndex; i++) {
    this.itemsBasePredictor[i] = 0;
    for (var f = 0; f < this.features; f++) {
      if (!this.itemsFeatureVectors[i]) {
        this.itemsFeatureVectors[i] = [];
      }
      this.itemsFeatureVectors[i].push(0.05 * f);
    };
  }



  while (Math.abs(this.rmseOld - this.rmse) > 0.00001) {
    this.rmseOld = this.rmse;
    this.rmse = 0;
    for (var u in this.dataSetMatrix) {
      for (var i in this.dataSetMatrix[u]) {
        // ошибка
        this.error = this.dataSetMatrix[u][i] - (this.mu + this.usersBasePredictor[u] + this.itemsBasePredictor[i] + this.Dot(u, i));
        this.rmse = this.rmse + Math.pow(this.error, 2)


        // применяем правила апдейта для базовых предикторов
        this.mu = this.mu + (this.eta * this.error);
        this.usersBasePredictor[u] = this.usersBasePredictor[u] + (this.eta * (this.error - this.lambda * this.usersBasePredictor[u]));
        this.itemsBasePredictor[i] = this.itemsBasePredictor[i] + (this.eta * (this.error - this.lambda * this.itemsBasePredictor[i]));

        //применяем правила апдейта для векторов признаков
        for (var f = 0; f < this.features; f++) {
          this.usersFeatureVectors[u][f] = this.usersFeatureVectors[u][f] + (this.eta * (this.error * this.itemsFeatureVectors[i][f] - this.lambda * this.usersFeatureVectors[u][f]));
          this.itemsFeatureVectors[i][f] = this.itemsFeatureVectors[i][f] + (this.eta * (this.error * this.usersFeatureVectors[u][f] - this.lambda * this.itemsFeatureVectors[i][f]));
        };
      }
    }

    this.iterationNumber++;

    // нормируем суммарную ошибку, чтобы получить rmse
    this.rmse = Math.sqrt(this.rmse / this.ratingCount);
    if (isNaN(this.rmse)) {
      throw 'RMSE NaN';
    }
    console.log('Iteration ' + this.iterationNumber + ' RMSE ' + this.rmse)
    if (this.rmse > this.rmseOld - this.threshold) {
      this.eta = this.eta * 0.66;
      this.threshold = this.threshold * 0.5;
    }

  }
}

SVDModel.prototype.Dot = function(u, i) {
  res = 0;
  for (var f = 0; f < this.features; f++) {
    res += this.usersFeatureVectors[u][f] * this.itemsFeatureVectors[i][f]
  }
  return res;
}








// get base data
var dataSet = [];
var user, item, rating;
var fileData = fs.readFileSync('u1.base', {
  encoding: 'utf-8'
});
var myRe = /([0-9]*)\t([0-9]*)\t([0-9]*)\t([0-9]*)/g;
while ((myArray = myRe.exec(fileData)) != null) {
  user = myArray[1];
  item = myArray[2];
  rating = myArray[3];
  dataSet.push([user, item, rating]);
}

// get test data
var dataSetTest = [];
var fileData = fs.readFileSync('u1.test', {
  encoding: 'utf-8'
});
var myRe = /([0-9]*)\t([0-9]*)\t([0-9]*)\t([0-9]*)/g;
while ((myArray = myRe.exec(fileData)) != null) {
  user = myArray[1];
  item = myArray[2];
  rating = myArray[3];
  dataSetTest.push([user, item, rating]);
}





// init SVDModel
var SVDModelObject = new SVDModel({
  dataSetBase: dataSet,
  lambda: 0.1,
  features: 2
});

// get RMSE
var SVD;
var E_SVD = 0;
var T = 0;
for (var i = dataSetTest.length - 1; i >= 0; i--) {
  T++;
  user = dataSetTest[i][0];
  item = dataSetTest[i][1];
  rating = dataSetTest[i][2];
  SVD = SVDModelObject.mu + SVDModelObject.usersBasePredictor[user] + SVDModelObject.itemsBasePredictor[item] + SVDModelObject.Dot(user, item);
  E_SVD += Math.pow((SVD - rating), 2)
  RMSE_SVD = Math.sqrt(E_SVD / T);
  console.log("SVD:(" + SVD.toFixed(2) + ") " + RMSE_SVD.toFixed(4) + " U:" + user + " I:" + item + " R:" + rating)
};

console.log("ALL")
