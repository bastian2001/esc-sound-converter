<template>
	<div class="converter">
		<div class="rtttlInput inputWrapper">
			<p :class="{ active: rtttl.length || rtttlActive }">Bluejay</p>
			<textarea
				v-model="rtttl"
				@input="updateBL32"
				@focusin="rtttlActive = true"
				@focusout="rtttlActive = false"
			></textarea>
		</div>
		<div class="bl32Input inputWrapper">
			<p :class="{ active: bl32.length || bl32Active }">BLHeli32</p>
			<textarea
				v-model="bl32"
				@input="updateRTTTL"
				@focusin="bl32Active = true"
				@focusout="bl32Active = false"
			></textarea>
		</div>
		<div class="info">
			<div class="transpose">
				<h4>Transpose</h4>
				<div class="transposeOnceButtons transposeButtons">
					<button @click="transposeBy(1)">
						<i class="fa-solid fa-arrow-up"></i>&nbsp;
						<p style="display: inline; font-family: inherit" v-if="transposed > 0">
							{{ transposed }}
						</p></button
					><br />
					<button @click="transposeBy(-1)">
						<i class="fa-solid fa-arrow-down"></i>&nbsp;
						<p style="display: inline; font-family: inherit" v-if="transposed < 0">
							{{ -transposed }}
						</p>
					</button>
				</div>
				<div class="transposeOctaveButtons transposeButtons">
					<button @click="transposeBy(12)"><i class="fa-solid fa-arrow-up"></i>&nbsp;Octave</button><br />
					<button @click="transposeBy(-12)"><i class="fa-solid fa-arrow-down"></i>&nbsp;Octave</button>
				</div>
			</div>
			<p class="time" :class="{ red: !timeEqual }"><i class="fa-regular fa-clock"></i>&nbsp;&nbsp;{{ time }} bars</p>
			<p v-for="e in error"><i class="fa-regular fa-circle-xmark"></i>&nbsp;&nbsp;{{ e }}</p>
			<p v-for="w in warning"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp;&nbsp;{{ w }}</p>
		</div>
	</div>
</template>

<script lang="ts">
// RTTTL (Bluejay) has a range from D#3 to D7
// BlHeli32/BL32 has a range from C4 to B7

export default {
	name: "Converter",
	props: {
		timeEqual: Boolean,
	},
	data() {
		return {
			rtttl: "",
			bl32: "",
			error: [] as string[],
			warning: [] as string[],
			notes: [] as { duration: number; name: string; octave: number }[],
			rtttlActive: false,
			bl32Active: false,
			transposed: 0,
		}
	},
	methods: {
		decodeRTTTL(): { errors: string[]; warnings: string[] } {
			const errors: string[] = []
			const warnings: string[] = []
			let notes: (string | { duration: number; name: string; octave: number })[] = this.rtttl
				.replace(/\s/g, "")
				.toLocaleUpperCase()
				.split(":")
			if (this.rtttl) {
				let defaultLength = -1,
					defaultOctave = -1,
					defaultBPM = -1
				if (notes.length !== 3) {
					if (!warnings.includes("Invalid RTTTL options, defaults will be auto-generated"))
						warnings.push("Invalid RTTTL options, defaults will be auto-generated")
					defaultLength = 4
					defaultOctave = 5
					defaultBPM = 125
				} else {
					const options = (notes as string[])[1].split(",")
					options.forEach(option => {
						const optionName = option.substring(0, option.search("="))
						const optionValue = parseInt(option.substring(option.search("=") + 1)) || -1
						if (optionName === "D") defaultLength = optionValue
						if (optionName === "O") defaultOctave = optionValue
						// if (optionName === "B") defaultBPM = optionValue
					})
					if (defaultLength === -1) {
						if (!warnings.includes("Invalid RTTTL options, defaults will be auto-generated"))
							warnings.push("Invalid RTTTL options, defaults will be auto-generated")
						defaultLength = 4
					}
					if (defaultOctave === -1) {
						if (!warnings.includes("Invalid RTTTL options, defaults will be auto-generated"))
							warnings.push("Invalid RTTTL options, defaults will be auto-generated")
						defaultOctave = 5
					}
				}
				notes = (notes as string[])[notes.length - 1].split(",")
				;(notes as string[]).forEach((note, index) => {
					const firstLetter = note.search(/[a-zA-Z]/)
					//note length starting at first digit after a letter or hashtag
					let octaveStartingAt = note.search(/(?<=[A-Z#])\d/)
					if (octaveStartingAt === -1) octaveStartingAt = note.length
					if (note.includes(".")) {
						if (!warnings.includes("Syncopes are not supported in BlHeli32"))
							warnings.push("Syncopes are not supported in BlHeli32")
						note = note.replace(/\./g, "")
					}
					const noteName = note.substring(firstLetter, octaveStartingAt)
					const noteLength = parseInt(note.substring(0, firstLetter)) || defaultLength
					const noteOctave = parseInt(note.substring(octaveStartingAt)) || defaultOctave
					if (noteName && noteOctave && noteLength) {
						const noteNames = ["C", "D", "E", "F", "G", "A", "B", "P", "C#", "D#", "F#", "G#", "A#"]
						if (!noteNames.includes(noteName))
							if (!errors.includes("Invalid note name. Keep in mind, h is written as b, only # and no ♭ are allowed."))
								errors.push("Invalid note name. Keep in mind, h is written as b, only # and no ♭ are allowed.")
						if (Number.isNaN(noteOctave))
							if (!errors.includes("octave is not a number")) errors.push("octave is not a number")
						if (Number.isNaN(noteLength))
							if (!errors.includes("note length is not a number")) errors.push("note length is not a number")
						notes[index] = {
							duration: noteLength,
							name: noteName,
							octave: noteOctave,
						}
					} else if (note) {
						if (!errors.includes("incomplete note")) errors.push("incomplete note")
					}
				})
				warnings.push(...this.generateNoteWarnings(notes as { duration: number; name: string; octave: number }[]))
			} else this.transposed = 0
			this.error = errors
			this.warning = []
			if (errors.length > 0) {
				return { errors, warnings }
			}
			this.warning = warnings
			this.notes = notes as { duration: number; name: string; octave: number }[]
			return { errors, warnings }
		},
		encodeRTTTL() {
			if (this.notes.length && this.notes[0].name) {
				//this code is still executed because
				this.rtttl =
					"Melody:d=4,o=5,b=125:" +
					this.notes
						.map(note => {
							if (typeof note === "string") return note
							else {
								if (note.name === "P") return `${note.duration}p`
								else return `${note.duration}${note.name.toLocaleLowerCase()}${note.octave}`
							}
						})
						.join(",")
			} else this.rtttl = ""
		},
		decodeBL32(): { errors: string[]; warnings: string[] } {
			//insert space between notes for splitting. That is always between a number and a letter
			const notes: (string | { duration: number; name: string; octave: number })[] = this.bl32
				.replace(/\s/g, "") //remove any whitespace
				.replace(/(\d)([A-Z])/g, "$1 $2") //insert space between number and letter
				.replace(/1\//g, "") //remove 1/ from note length
				.toLocaleUpperCase()
				.split(" ")
			const errors: string[] = []
			const warnings: string[] = []
			if (this.bl32) {
				;(notes as string[]).forEach((note, index) => {
					if (note.length > 1) {
						const numStart = note.search(/\d/)
						const noteName = note.substring(0, numStart)
						const noteOctave = parseInt(note.substring(numStart, numStart + 1))
						const noteLength = parseInt(note.substring(noteName === "P" ? numStart : numStart + 1))
						if (typeof noteLength !== "number")
							if (!errors.includes("note length is not a number")) errors.push("note length is not a number")
						const noteNames = ["C", "D", "E", "F", "G", "A", "B", "P", "C#", "D#", "F#", "G#", "A#"]
						if (!noteNames.includes(noteName))
							if (!errors.includes("Invalid note name. Keep in mind, h is written as b, only # and no ♭ are allowed."))
								errors.push("Invalid note name. Keep in mind, h is written as b, only # and no ♭ are allowed.")
						if (Number.isNaN(noteOctave))
							if (!errors.includes("octave is not a number")) errors.push("octave is not a number")
						if (Number.isNaN(noteLength))
							if (!errors.includes("note length is not a number")) errors.push("note length is not a number")
						notes[index] = {
							duration: noteLength,
							name: noteName,
							octave: noteOctave,
						}
					} else {
						if (!errors.includes("incomplete note")) errors.push("incomplete note")
					}
				})
				warnings.push(...this.generateNoteWarnings(notes as { duration: number; name: string; octave: number }[]))
			} else this.transposed = 0
			this.error = errors
			this.warning = []
			if (errors.length > 0 && notes.length > 0) {
				return { errors, warnings }
			}
			this.warning = warnings
			this.notes = notes as { duration: number; name: string; octave: number }[]
			return { errors, warnings }
		},
		encodeBL32() {
			this.bl32 = this.notes
				.map(note => {
					if (typeof note === "string") return note //should never happen
					else {
						if (note.name === "P") return `P${note.duration}`
						else return `${note.name}${note.octave} ${note.duration}`
					}
				})
				.join(" ")
		},
		updateRTTTL() {
			const erwarn = this.decodeBL32()
			if (erwarn.errors.length) return
			this.encodeRTTTL()
		},
		updateBL32() {
			const erwarn = this.decodeRTTTL()
			if (erwarn.errors.length) return
			this.encodeBL32()
		},
		transposeup() {
			//transposing up by one part note
			const possibleNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
			this.notes.forEach((note, index) => {
				if (typeof note === "string") return
				if (note.name === "P") return
				note.name = possibleNotes[(possibleNotes.indexOf(note.name) + 1) % 12]
				if (possibleNotes.indexOf(note.name) === 0) note.octave++
			})
			this.encodeRTTTL()
			this.encodeBL32()
		},
		transposedown() {
			const possibleNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
			this.notes.forEach((note, index) => {
				if (typeof note === "string") return
				if (note.name === "P") return
				note.name = possibleNotes[(possibleNotes.indexOf(note.name) + 11) % 12]
				if (possibleNotes.indexOf(note.name) === 11) note.octave--
			})
			this.encodeRTTTL()
			this.encodeBL32()
		},
		transposeBy(amount: number) {
			for (let i = 0; i < Math.abs(amount); i++) {
				if (amount > 0) this.transposeup()
				else this.transposedown()
			}
			this.warning = this.generateNoteWarnings(this.notes)
			this.transposed += amount
			if (this.notes.length === 0) this.transposed = 0
		},
		generateNoteWarnings(notes: { duration: number; name: string; octave: number }[]): string[] {
			const warnings: string[] = []
			const possibleNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
			notes.forEach(note => {
				if (note.octave < 4)
					if (!warnings.includes("Note too low for BlHeli32")) warnings.push("Note too low for BlHeli32")
				if (note.octave > 7)
					if (!warnings.includes("Note too high for BlHeli32")) warnings.push("Note too high for BlHeli32")
				const noteIndex = possibleNotes.indexOf(note.name)
				if (note.name !== "P" && (note.octave < 3 || (note.octave === 3 && noteIndex < 3)))
					if (!warnings.includes("Note too low for Bluejay")) warnings.push("Note too low for Bluejay")
				if (note.name !== "P" && (note.octave > 7 || (note.octave === 7 && noteIndex > 2)))
					if (!warnings.includes("Note too high for Bluejay")) warnings.push("Note too high for Bluejay")

				if (note.name === "P") {
					if (
						note.duration !== 1 &&
						note.duration !== 2 &&
						note.duration !== 4 &&
						note.duration !== 8 &&
						note.duration !== 16 &&
						note.duration !== 32 &&
						note.duration !== 64 &&
						note.duration !== 128
					)
						if (!warnings.includes("Keep pause lengths to 1/1, 1/2, 1/4, ... 1/128 for BlHeli32"))
							warnings.push("Keep pause lengths to 1/1, 1/2, 1/4, ... 1/128 for BlHeli32")
				}
				if (note.name !== "P" && note.name)
					if (note.duration !== 1 && note.duration !== 2 && note.duration !== 4 && note.duration !== 8)
						if (!warnings.includes("BlHeli32 only supports 1/1, 1/2, 1/4, and 1/8 note lengths"))
							warnings.push("BlHeli32 only supports 1/1, 1/2, 1/4, and 1/8 note lengths")
			})
			return warnings
		},
	},
	computed: {
		time(): string {
			let time = 0
			this.notes.forEach(note => {
				if (typeof note === "string") return
				time += 1 / note.duration
			})
			return time.toFixed(2)
		},
	},
	watch: {
		time: function () {
			this.$emit("time", this.time)
		},
	},
}
</script>
<style scoped>
.converter {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 1.5rem;
	margin-bottom: 2rem;
}
textarea {
	width: 100%;
	min-height: 7rem;
	height: 100%;
	resize: none;
	outline: none;
	border: none;
	border-bottom: 2px solid lightgray;
	margin-top: 0.5rem;
	background-color: transparent;
	color: white;
	font-family: "Roboto Mono", monospace;
}
p {
	font-family: "Roboto Mono", monospace;
}
.transpose {
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;
}
.transposeButtons {
	margin-left: 1rem;
}
.transposeButtons button {
	background-color: transparent;
	border: 1px solid #eed;
	display: inline-block;
	padding: 2px;
	width: 6rem;
	border-radius: 5px;
	color: #eed;
	font-size: 1rem;
}
.transposeButtons button:first-child {
	margin-bottom: 5px;
}

.inputWrapper p {
	position: absolute;
	margin-top: 0.6rem;
	margin-left: 0.5rem;
	transition: all 0.4s ease-out;
	font-size: 1rem;
}
.inputWrapper p.active {
	transform: translate(-0.4rem, -0.8rem);
	font-size: 0.71rem;
}

.red {
	color: #f00;
}
</style>
