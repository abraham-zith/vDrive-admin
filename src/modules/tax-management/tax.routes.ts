
import { Router } from 'express';
import { TaxController } from './tax.controller';
import { validateBody, validateParams } from '../../utilities/helper';
import { TaxValidation } from './tax.validator';

const router = Router();

router.get('/', TaxController.getTaxes);

router.get(
  '/:id',
  validateParams(TaxValidation.idValidation),
  TaxController.getTaxById
);

router.post(
  '/create',
  validateBody(TaxValidation.createValidation),
  TaxController.createTax
);

router.patch(
  '/update/:id',
  validateParams(TaxValidation.idValidation),
  validateBody(TaxValidation.updateValidation),
  TaxController.editTax
);

router.patch(
  '/status/:id',
  validateParams(TaxValidation.idValidation),
  validateBody(TaxValidation.statusValidation),
  TaxController.toggleTaxStatus
);

router.delete(
  '/delete/:id',
  validateParams(TaxValidation.idValidation),
  TaxController.deleteTax
);

export default router;
