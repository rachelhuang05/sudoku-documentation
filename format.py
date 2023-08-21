# converts sudoku puzzles from grids into strings
with open("sudoku.txt") as f:
    puzzles = [line.strip() for line in f]
outputFile = open("sudokus.txt", "w")

formattedPuzzles = []

for i in range(1, len(puzzles), 10):
    zeroPuzzle = puzzles[i:i+9]
    gluedTogether = ""
    for row in zeroPuzzle:
        gluedTogether += row
    dotPuzzle = ""
    for c in gluedTogether:
        if c == "0":
            dotPuzzle += "."
        else:
            dotPuzzle += c
    formattedPuzzles+=[dotPuzzle]

print("Formatted Puzzles: ", formattedPuzzles)

for pzl in formattedPuzzles:
    outputFile.write(pzl+"\n")

