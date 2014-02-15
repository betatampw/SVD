console.log('Usage: perl svd.js features file');


var lambda1 = 0.0;
var lambda2 = 0.0;
var eta = 0.1;
var features = 2;
var file = [
[0,1,3],
[0,2,4],
[0,3,5],
[0,4,2],
[1,0,3],
[1,1,5],
[1,2,2],
[1,3,2],
[1,4,5],
[2,0,5],
[2,1,3],
[2,3,4],
[2,4,3],
[3,0,5],
[3,1,5],
[3,2,5],
[3,4,4],
[4,0,2],
[4,1,3],
[4,3,2],
[4,4,2]
];

var l = {};

function dot (v1, v2) {
	res = 0;
	for (var i = 0; i < features; i++) {
		res += v1[i] * v2[i]
	}
	return res;
}

var max_v = 0;
var max_u = 0;
var total - 0;
for (var i = file.length - 1; i >= 0; i--) {
	if(!v[file[i][0]]){
		v[file[i][0]] = {};
	}
	v[file[i][0]][file[i][2]] = file[i][3];
	if(file[i][2] > max_v)
		msx_v = file[i][2];
	if(file[i][1] > max_u)
		max_u = file[i][1];
	total++;
};
max_v++;
max_u++;

console.log('Read ' + max_u + ' users and ' + max_v + ' items')

// инициализируем 
var mu = 0;




















