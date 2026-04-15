export function getWording(timeOfDay: 'day' | 'night') {
  const isNight = timeOfDay === 'night';
  return {
    bee: isNight ? 'luciole' : 'abeille',
    bees: isNight ? 'lucioles' : 'abeilles',
    beesCapital: isNight ? 'Lucioles' : 'Abeilles',
    hive: isNight ? 'cocon' : 'ruche',
    hives: isNight ? 'cocons' : 'ruches',
    hiveCapital: isNight ? 'Cocon' : 'Ruche',
  };
}
