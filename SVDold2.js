var fs = require('fs');



SVDModel = function function_name(arParams) {
  this.baseDataSet = [];
  this.testDataSet = [];

  this.lambda = 0.2;
  this.eta = 0.1;
  this.features = 2;

  this.file = [];
  this.l = [];


  if ('object' == typeof(arParams) arParams.baseDataSet) {
    this.baseDataSet = arParams.baseDataSet;
  } else {
    throw "baseDataSet not determined"
  }

  if ('object' == typeof(arParams) arParams.testDataSet) {
    this.testDataSet = arParams.testDataSet
  } else {
    throw "testDataSet not determined"
  }
}



var baseDataSetFile = 'u1.base';
var testDataSetFile = "u1.test";

var lambda = 0.2;
var eta = 0.1;
var features = 10;
var file = [];
var l = {};

function dot(v1, v2) {
  res = 0;
  for (var i = 0; i < features; i++) {
    res += v1[i] * v2[i]
  }
  return res;
}


var fileData = fs.readFileSync(baseDataSetFile, {
  encoding: 'utf-8'
});
var myRe = /([0-9]*)\t([0-9]*)\t([0-9]*)\t([0-9]*)/g;
while ((myArray = myRe.exec(fileData)) != null) {
  file.push([(myArray[1] - 1), (myArray[2] - 1), myArray[3]])
}




var max_v = 0;
var max_u = 0;
var total = 0;
for (var i = 0, length = file.length; i < length; i++) {
  if (!l['u' + file[i][0]]) {
    l['u' + file[i][0]] = {};
  }
  l['u' + file[i][0]]['v' + file[i][1]] = file[i][2];

  if (file[i][1] > max_v)
    max_v = file[i][1];
  if (file[i][0] > max_u)
    max_u = file[i][0];

  total++;
};
max_u++;
max_v++;



console.log('Read ' + max_u + ' users and ' + max_v + ' items') //TODO chek

// инициализируем 
var mu = 0;

var b_u = {};
for (var u = 0; u < max_u; u++)
  b_u['u' + u] = 0;

var b_v = {};
for (var v = 0; v < max_v; v++)
  b_v['v' + v] = 0;



var u_f = [];
for (var u = 0; u < max_u; u++) {
  for (var f = 0; f < features; f++) {
    if (!u_f['u' + u]) {
      u_f['u' + u] = [];
    }
    u_f['u' + u].push(0.1)
  };
};

var v_f = [];
for (var v = 0; v < max_v; v++) {
  for (var f = 0; f < features; f++) {
    if (!v_f['v' + v]) {
      v_f['v' + v] = [];
    }
    v_f['v' + v].push(0.05 * f)
  };
};



var iter_no = 0;
var err = 0;
var rmse = 1;
var old_rmse = 0;
var threshold = 0.01;

// обучение SVD: обучаем, пока не сойдётся

while (Math.abs(old_rmse - rmse) > 0.00001) {
  old_rmse = rmse;
  rmse = 0;
  for (var u in l) {
    for (var v in l[u]) {
      // ошибка

      err = l[u][v] - (mu + b_u[u] + b_v[v] + dot(u_f[u], v_f[v]));
      rmse = rmse + Math.pow(err, 2)


      // применяем правила апдейта для базовых предикторов
      mu = mu + (eta * err);
      b_u[u] = b_u[u] + (eta * (err - lambda * b_u[u]));
      b_v[v] = b_v[v] + (eta * (err - lambda * b_v[v]));

      //применяем правила апдейта для векторов признаков
      for (var f = 0; f < features; f++) {
        u_f[u][f] = u_f[u][f] + (eta * (err * v_f[v][f] - lambda * u_f[u][f]));
        v_f[v][f] = v_f[v][f] + (eta * (err * u_f[u][f] - lambda * v_f[v][f]));
      };
    }
    //console.log("v_f[v285] " + v_f["v285"])
  }

  iter_no++;

  // нормируем суммарную ошибку, чтобы получить RMSE

  rmse = Math.sqrt(rmse / total);
  if (isNaN(rmse)) {
    throw 'rmse NaN';
  }
  console.log('Iteration ' + iter_no + ' RMSE ' + rmse)
  if (rmse > old_rmse - threshold) {
    eta = eta * 0.66;
    threshold = threshold * 0.5;
  }

}


/*
console.dir('mu ' + mu);
console.dir('User base ');
console.dir(b_u);
console.dir('Item base ');
console.dir(b_v);
console.dir('User features')
for (var u in u_f) {
  console.log('  user ' + u + ': ' + u_f[u]);
};

console.dir('Item features')
for (var v in v_f) {
  console.log('  item ' + v + ': ' + v_f[v]);
};
*/

var SVD;
var T = 0;
var E_SVD = 0;
var fileData = fs.readFileSync(testDataSetFile, {
  encoding: 'utf-8'
});
var myRe = /([0-9]*)\t([0-9]*)\t([0-9]*)\t([0-9]*)/g;
while ((myArray = myRe.exec(fileData)) != null) {

  u = myArray[1] - 1;
  i = myArray[2] - 1;
  tmpR = myArray[3];
  T++;

  SVD = mu + b_u['u' + u] + b_v['v' + i] + dot(u_f['u' + u], v_f['v' + i]);
  E_SVD += Math.pow((SVD - tmpR), 2)

  RMSE_SVD = Math.sqrt(E_SVD / T);
  console.log("SVD:(" + SVD.toFixed(2) + ") " + RMSE_SVD.toFixed(4) + " U:" + u + " I:" + i + " R:" + tmpR)

}

console.log("ALL")
