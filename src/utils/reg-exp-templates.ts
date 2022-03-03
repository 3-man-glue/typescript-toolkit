function rfc3339DateTime(): RegExp {
  return new RegExp(
    '^(?<date>\\d{4}-\\d{2}-\\d{2})'
    + '(?<time>T\\d{2}:\\d{2}:\\d{2})(?<ms>.{0}|\\.\\d{2,3})'
    + '(?<zone>Z|[+-]\\d{2}:\\d{2})?$',
  )
}

export default { rfc3339DateTime }
