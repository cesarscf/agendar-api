export function splitDate(date: Date) {
  const [hour, minutes] = date.toLocaleTimeString().split(":")
  return { day: date, hour: `${hour}:${minutes}` }
}

export function addMinutes(horaStr: string, minutesToAdd: number): Date {
  const [hora, minuto] = horaStr.split(":").map(Number)
  const data = new Date()
  data.setHours(hora)
  data.setMinutes(minuto)
  data.setSeconds(0)
  data.setMilliseconds(0)
  data.setMinutes(data.getMinutes() + minutesToAdd)

  return data
}
