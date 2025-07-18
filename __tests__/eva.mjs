import { Eva, Environment } from "../Eva.mjs";
import { test } from "./test-utils.mjs";

const eva = new Eva();

/**
 * expressions
 */
test(eva, "1", 1);
test(eva, '"hello"', "hello");
test(eva, `(+ 1 2)`, 3);
test(eva, `(+ 1 (+ 2 3))`, 6);
test(eva, `(* 2 3)`, 6);
test(eva, `(* 2 (* 3 4))`, 24);

/**
 * variables
 */
test(eva, `(var x 1)`, 1);
test(eva, `(begin (var x 1) (set x (+ x 1)))`, 2);
// assert.throws(() => eva.eval("y", env), /Undefined variable: y$/);


/**
 * blocks
 */
test(eva, `(begin 1 2 3)`, 3);
test(eva, `(begin (var x 1) (set x 2) x)`, 2);

/**
 * nested blocks
 */
test(eva, `(begin (var x 1) (begin (set x 2) x))`, 2);
test(eva, `(begin (var x 1) (begin (var x 2)) x)`, 1);

/**
 * control flow / route
 */

/**
 *  (if <condition> 
 *    <consequence> 
 *    <alternative>)
 */
test(eva, `(begin (var x 1) (var y 2) (if (> x 10) (set x 3) (set y 4)) y)`, 4);

test(eva, `(begin (var x 1) (var y 10) (while (< x y) (begin (set x (+ x 1)))) x)`, 10);


/**
 * functions
 */

test(eva, `
  (
    begin
      (def square (x) (* x x))
      (square 2)
  )
  `, 4)

test(eva, `
  (
    begin
      (def calc (x y) (begin (var z 1) (+ x (+ y z))))
      (calc 1 2)
  )
  `, 4)

test(eva, `
  (
    begin
      (var z 3)
      (def calc (x y) (begin (+ (* x y) z)))
      (calc 2 4)
  )
  `, 11)


  // closure
test(eva, `
  (
    begin
      (var x 1)
      (def calc (x y) (begin (def inner (z) (+ (* x y) z))))
      (var fn (calc 2 4))
      (fn 1)
  )
  `, 9)


// lambda
test(eva, `
  (
    begin
      (def onClick (callback)
        (begin
          (var x 1)
          (var y 2)
          (callback x y)
        )
      )
      (onClick (lambda (x y) (+ x y)))
  )
  `, 3)

  // IIFE
  test(eva, `
    (
      (lambda (x) (+ x 1)) 2
    )
    `, 3)


  // syntax sugar (switch / for)
/**
 * (switch
 *   (<case1> <consequence1>)
 *   (<case2> <consequence2>)
 *   ...
 *   (<else> <alternate>)
 * )
 */

test(eva, `
  (
    begin
      (var x 1)
      (switch
        ((= x 1) (set x 2))
        ((= x 2) (set x 3))
        (else (set x 4))
      )
      x
    )
    `, 2)


/**
 * (for (<init> <condition> <update> <body>)
 */
test(eva, `
  (
    begin
      (var x 0)
      (for (var i 0) (< i 10) (set i (+ i 1)) (set x (+ x i)))
      x
    )
    `, 45)

console.log("All tests passed");
