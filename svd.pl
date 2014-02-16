#!/usr/bin/perl

use strict;
use warnings;

if ($#ARGV < 1) {
	print "Usage: perl svd.pl features file\n";
	exit(0);
}

my $lambda1 = 0.0;
my $lambda2 = 0.0;
my $eta = 0.1;
my $features = shift;
my $fname = shift;

my %l;

# скалярное произведение
sub dot {
	my $v1 = shift;
	my $v2 = shift;
	my $res = 0;
	for(my $i=0; $i < $features; ++$i) {
		$res += @{$v1}[$i] * @{$v2}[$i];
	}
	return $res;
}

# читаем вход
open LIKED, $fname or die "Cannot open " . $fname;
my $max_v = 0;
my $total = 0;
while (<LIKED>) {
	if (/([0-9]*);([0-9]*);([\-0-9]*)/) {
		$l{$1}{$2} = $3;
		if ($2 > $max_v) { $max_v = $2; }
		++$total;
	}
}
close LIKED;
my $max_u = keys(%l);
$max_v++;


print "Read " . $max_u . " users and " . $max_v . " urls.\n";

# инициализируем 
my $mu = 0;
my @b_u = ((0) x $max_u);
my @b_v = ((0) x $max_v);



my @u_f;
for (my $u=0; $u<$max_u; ++$u) {
	for (my $f=0; $f < $features; ++$f) {
		push @{ $u_f[$u] }, 0.1;
	}

}
 


my @v_f;
for (my $v=0; $v<$max_v; ++$v) {
	for (my $f=0; $f < $features; ++$f) {
		push @{ $v_f[$v] }, 0.05 * $f;
	}
}

my $iter_no = 0;
my $err = 0;
my $rmse = 1;
my $old_rmse = 0;
my $threshold = 0.01;

# обучение SVD: обучаем, пока не сойдётся
while (abs($old_rmse - $rmse) > 0.00001 ) {
	$old_rmse = $rmse;
	$rmse = 0;
	foreach my $u ( keys %l ) {
		foreach my $v ( keys %{$l{$u}} ) {
			# ошибка
			my $tmp0 = dot($u_f[$u], $v_f[$v]);
			$err = $l{$u}{$v} - ($mu + $b_u[$u] + $b_v[$v] + dot($u_f[$u], $v_f[$v]) );
			

			# квадрат ошибки
			$rmse += $err * $err;

			# применяем правила апдейта для базовых предикторов
			$mu += $eta * $err;
			$b_u[$u] += $eta * ($err - $lambda2 * $b_u[$u]);
			$b_v[$v] += $eta * ($err - $lambda2 * $b_v[$v]);
			# и для векторов признаков
			for (my $f=0; $f < $features; ++$f) {
				$u_f[$u][$f] += $eta * ($err * $v_f[$v][$f] - $lambda2 * $u_f[$u][$f]);
				$v_f[$v][$f] += $eta * ($err * $u_f[$u][$f] - $lambda2 * $v_f[$v][$f]);
			}
		}
	}
	++$iter_no;
	# нормируем суммарную ошибку, чтобы получить RMSE
	$rmse = sqrt($rmse / $total);
	print "Iteration $iter_no RMSE=" . $rmse . "\n";
	# если RMSE меняется мало, нужно уменьшить скорость обучения
	if ($rmse > $old_rmse - $threshold) {
		$eta = $eta * 0.66;
		$threshold = $threshold * 0.5;
	}
}

# печать массива
sub print_array {
	my $prefix = shift;
	my $arr = shift;
	print "$prefix\t";
	foreach my $x (@{$arr}) {
		printf "%.4f\t", $x;
	}
	print "\n";
}

# печать всех массивов
sub print_all {
	print "       mu:\t" . $mu . "\n";
	print_array( "User base:", \@b_u );
	print_array( "Item base:", \@b_v );
	print "User features\n";
	for(my $u=0; $u < scalar(@u_f); ++$u) {
		print_array( "  user $u:", $u_f[$u] );
	}
	print "Item features:\n";
	for(my $v=0; $v < scalar(@v_f); ++$v) {
		print_array( "  item $v:", $v_f[$v] );
	}
}

print_all();
my $tmp = $mu  + $b_u['0'] + $b_v['0'] + ($u_f['0']['0'])*($v_f['0']['0']) + ($u_f['0']['1'])*($v_f['0']['1']);
print "MAIN :$tmp\n";
