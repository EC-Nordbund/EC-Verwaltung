export const name = 'filter'

export default function filterGenerator(suche: string) {
  return (item: any) => filterData(item, suche)
}

// export function filter (items:Array<any>, suche:string) {
//   return items.filter((item)=>filterData(item, suche))
// }

function filterData(item: any, suche: string): boolean {
  return suche
    .toLowerCase()
    .split(/\.|\-\s/g)
    .every((suchePart: string) => filterPart(item, suchePart))
}

function filterPart(item: any, suche: string): boolean {
  if (!suche) {
    return true
  }
  if (typeof item === 'string') {
    return item.toLowerCase().includes(suche)
  } else if (typeof item === 'number' || typeof item === 'boolean') {
    return item.toString().toLowerCase().includes(suche)
  } else if (item) {
    return Object.keys(item).some((key) => filterPart(item[key], suche))
  } else {
    return false
  }
}
