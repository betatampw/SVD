var lambda1 = 0.0;
var lambda2 = 0.0;
var eta = 0.1;
var features = 2;
var file = [
  [0, 1, 3],
  [0, 2, 4],
  [0, 3, 5],
  [0, 4, 2],
  [1, 0, 3],
  [1, 1, 5],
  [1, 2, 2],
  [1, 3, 2],
  [1, 4, 5],
  [2, 0, 5],
  [2, 1, 3],
  [2, 3, 4],
  [2, 4, 3],
  [3, 0, 5],
  [3, 1, 5],
  [3, 2, 5],
  [3, 4, 4],
  [4, 0, 2],
  [4, 1, 3],
  [4, 3, 2],
  [4, 4, 2]
];

var file = [
  [4, 4, 2],
  [4, 1, 3],
  [4, 3, 2],
  [4, 0, 2],
  [1, 4, 5],
  [1, 1, 5],
  [1, 3, 2],
  [1, 0, 3],
  [1, 2, 2],
  [3, 4, 4],
  [3, 1, 5],
  [3, 0, 5],
  [3, 2, 5],
  [0, 4, 2],
  [0, 1, 3],
  [0, 3, 5],
  [0, 2, 4],
  [2, 4, 3],
  [2, 1, 3],
  [2, 3, 4],
  [2, 0, 5]
];


var l = {};

function dot(v1, v2) {
  res = 0;
  for (var i = 0; i < features; i++) {
    res += v1[i] * v2[i]
  }
  return res;
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
      b_u[u] = b_u[u] + (eta * (err - lambda2 * b_u[u]));
      b_v[v] = b_v[v] + (eta * (err - lambda2 * b_v[v]));

      //и для векторов признаков
      for (var f = 0; f < features; f++) {
        u_f[u][f] = u_f[u][f] + (eta * (err * v_f[v][f] - lambda2 * u_f[u][f]));
        v_f[v][f] = v_f[v][f] + (eta * (err * u_f[u][f] - lambda2 * v_f[v][f]));
      };
    }
  }
  iter_no++;

  // нормируем суммарную ошибку, чтобы получить RMSE
  rmse = Math.sqrt(rmse / total);
  //console.log('Iteration ' + iter_no + ' RMSE ' + rmse)
  if (rmse > old_rmse - threshold) {
    eta = eta * 0.66;
    threshold = threshold * 0.5;
  }

}



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

tmp = mu + b_u['u0'] + b_v['v0'] + (u_f['u0']['0']) * (v_f['v0']['0']) + (u_f['u0']['1']) * (v_f['v0']['1']);
console.log(tmp)
