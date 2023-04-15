//notes pinia store
import { defineStore } from "pinia"

type Note = {
	octave: number
	name: string
	duration: number
	syncopation?: number
}

export const notesStore = defineStore({
	id: "notes",
	state: () => ({
		converters: [
			{
				notes: [] as Note[],
				rtttl: "",
				bl32: "",
				updateFlag: false,
				bpm: 256,
				calcBPM: 256,
			},
			{
				notes: [] as Note[],
				rtttl: "",
				bl32: "",
				updateFlag: false,
				bpm: 256,
				calcBPM: 256,
			},
			{
				notes: [] as Note[],
				rtttl: "",
				bl32: "",
				updateFlag: false,
				bpm: 256,
				calcBPM: 256,
			},
			{
				notes: [] as Note[],
				rtttl: "",
				bl32: "",
				updateFlag: false,
				bpm: 256,
				calcBPM: 256,
			},
		],
		customPresets: {} as any,
		generalPresets: {} as any,
	}),
	actions: {
		updateNotes(notes: Note[], converter: number) {
			this.converters[converter].notes = notes
		},
		init() {
			fetch("/sounds.json")
				.then(res => res.json())
				.then(data => {
					this.generalPresets = data
				})
			//load custom presets from local storage if they exist
			if (localStorage.getItem("customPresets")) {
				this.customPresets = JSON.parse(localStorage.getItem("customPresets")!)
			}
		},
		addCustomPreset(name: string) {
			if (!name) return alert("Please enter a name for the preset")
			if (this.generalPresets[name]) return alert("Cannot overwrite a general preset")
			//check for duplicate names
			if (this.customPresets[name]) {
				if (!confirm("A preset with that name already exists. Overwrite?")) return
			}
			this.customPresets[name] = {
				channels: this.converters.map(converter => {
					return converter.rtttl
				}),
			}
			localStorage.setItem("customPresets", JSON.stringify(this.customPresets))
		},
		loadPreset(preset: string) {
			if (this.generalPresets[preset]) {
				this.generalPresets[preset].channels.forEach((channel: string, index: number) => {
					this.converters[index].rtttl = channel || ""
					this.converters[index].updateFlag = true
				})
			} else if (this.customPresets[preset]) {
				this.customPresets[preset].channels.forEach((channel: string, index: number) => {
					this.converters[index].rtttl = channel || ""
					this.converters[index].updateFlag = true
				})
			}
		},
		deletePreset(preset: string) {
			if (this.generalPresets[preset]) return alert("Cannot delete a general preset")
			if (this.customPresets[preset]) {
				delete this.customPresets[preset]
				localStorage.setItem("customPresets", JSON.stringify(this.customPresets))
			}
		},
	},
})
