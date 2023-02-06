package main

import "fmt"

func main() {
	m := make(map[int]string)

	m[0] = "Bill"
	m[123] = "Bob"
	m[44] = "Stacy"
	m[2] = "Ryan"

	for id, name := range m {
		fmt.Printf("id: %-5d name: %s\n", id, name)
		if id == 123 {
			delete(m, id)
		}
	}

	fmt.Printf("\n")

	for id, name := range m {
		fmt.Printf("id: %-5d name: %s\n", id, name)
	}
}
