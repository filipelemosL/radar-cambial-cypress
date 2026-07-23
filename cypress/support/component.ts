import { mount } from 'cypress/react'
import '../../src/styles.css'
import './commands'

Cypress.Commands.add('mount', mount)
