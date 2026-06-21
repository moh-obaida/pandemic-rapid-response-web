/** Maps engine errors to player-friendly mission-control copy (UI only). */
const FRIENDLY: Record<string, string> = {
  'Not your turn': 'Only the active player can act.',
  'Timer event in progress': 'Timer event resolving. Actions are paused.',
  'Must be in room to assign': 'You must be in this room to assign dice.',
  'Die face does not match room': 'This die does not match the room.',
  'Must be in room': 'You must be in this room to take that action.',
  'Missing required crates in cargo': 'Cargo is missing required supplies for delivery.',
  'No city card at plane position': 'No active city at the plane position.',
  'Clear delivery blocker first': 'Resolve the delivery blocker before delivering.',
  'Can only reroll unassigned dice': 'Reroll only applies to dice in your hand.',
  'No rerolls left': 'No rerolls remaining this turn.',
  'Resolve waste roll first': 'Finish the waste roll before continuing.',
  'Roll dice first': 'Roll your dice first.',
  'Assign full group at once': 'Assign all dice in the group to matching slots at once.',
  'Connection failed. Try again.': 'Connection failed. Check your network and try again.',
  'Die not available': 'That die is assigned, spent, or locked.',
}

export function friendlyError(message: string): string {
  if (FRIENDLY[message]) return FRIENDLY[message]

  if (message.includes('Missing required') || message.includes('Missing crates')) {
    return 'Cargo is missing required supplies for delivery.'
  }
  if (message.includes('Must be in room')) {
    return 'You must be in this room to assign dice.'
  }
  if (message.includes('does not match')) {
    return 'This die does not match the room.'
  }

  return message
}
