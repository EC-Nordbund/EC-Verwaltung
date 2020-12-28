import Vue from 'vue'
import abmelden2 from './forms/abmelden.form'
import addAdresse2 from './forms/addAdresse.form'
import addAK2 from './forms/addAK.form'
import addFZ2 from './forms/addFZ.form'
import addMail2 from './forms/addMail.form'
import addPerson2 from './forms/addPerson.form'
import addTelefon2 from './forms/addTelefon.form'
import changePassword2 from './forms/changePassword.form'
import editBemerkungen2 from './forms/editBemerkungen.form'
import generateFZAntrag2 from './forms/generateFZAntrag.form'
import inactive2 from './forms/inactive.form'
import personBase2 from './forms/personBase'
import personMerge2 from './forms/personMerge.form'
import personStamm2 from './forms/personStamm.form'
Vue.prototype.$ecForm = {
  abmelden: abmelden2,
  addAdresse: addAdresse2,
  addAK: addAK2,
  addFZ: addFZ2,
  addMail: addMail2,
  addPerson: addPerson2,
  addTelefon: addTelefon2,
  changePassword: changePassword2,
  editBemerkungen: editBemerkungen2,
  generateFZAntrag: generateFZAntrag2,
  inactive: inactive2,
  personBase: personBase2,
  personMerge: personMerge2,
  personStamm: personStamm2
}
