import Vue from 'vue';

import abmelden from './forms/abmelden.form';
import addAdresse from './forms/addAdresse.form';
import addAK from './forms/addAK.form';
import addFZ from './forms/addFZ.form';
import addMail from './forms/addMail.form';
import addPerson from './forms/addPerson.form';
import addTelefon from './forms/addTelefon.form';
import changePassword from './forms/changePassword.form';
import editBemerkungen from './forms/editBemerkungen.form';
import generateFZAntrag from './forms/generateFZAntrag.form';
import inactive from './forms/inactive.form';
import personBase from './forms/personBase';
import personMerge from './forms/personMerge.form';
import personStamm from './forms/personStamm.form';

const m = [
  abmelden,
  addAdresse,
  addAK,
  addFZ,
  addMail,
  addPerson,
  addTelefon,
  changePassword,
  editBemerkungen,
  generateFZAntrag,
  inactive,
  personBase,
  personMerge,
  personStamm
];

Vue.prototype.$ecForm = {
  abmelden,
  addAdresse,
  addAK,
  addFZ,
  addMail,
  addPerson,
  addTelefon,
  changePassword,
  editBemerkungen,
  generateFZAntrag,
  inactive,
  personBase,
  personMerge,
  personStamm
};