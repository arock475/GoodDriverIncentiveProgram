package main

import (
	"fmt"
	"io"
	"os"
)

func ReadFile(filename string) (string, error) {
	f, err := os.Open(filename)
	if err != nil {
		return "", err
	}

	// Close the file when the function scope exits, regardless of where.
	defer f.Close()

	var contents []byte
	buf := make([]byte, 100)
	for {
		n, err := f.Read(buf[0:])
		contents = append(contents, buf[0:n]...)
		if err != nil {
			if err == io.EOF {
				break
			}
			return "", err
		}
	}

	return string(contents), nil
}

func main() {
	res, err := ReadFile("test.txt")
	if err != nil {
		return
	}

	fmt.Println(res)
}
