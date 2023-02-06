package main

import "fmt"

func two() (string, string) {
	return "String 1", "String 2"
}

// testing walrus assignment scopes
func main() {
	str1 := "Original String"
	{
		// does not reassign, creates new string
		str1 := "New String!"
		fmt.Println(str1)
	}
	fmt.Println(str1)

	// str1 reassigned
	str1, str2 := two()

	fmt.Println(str1)
	fmt.Println(str2)
}
