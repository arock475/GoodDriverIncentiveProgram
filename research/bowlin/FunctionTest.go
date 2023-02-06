package main

import "fmt"

func addNumbers(x, y int) int {
	return x + y
}

func addNumbersNakedReturn(x, y int) (output int) {
	output = x + y

	return
}

func main() {
	var x1, y1 int = 3, 4

	fmt.Println(addNumbers(x1, y1))

	x2, y2 := 15, -3
	fmt.Println(addNumbersNakedReturn(x2, y2))
}
