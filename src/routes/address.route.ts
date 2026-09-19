import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    addressIdParamSchema,
    createAddressSchema,
	updateAddressSchema,
} from "../validators/address.validator.js";
import * as addressController from "../controllers/address.controller.js";

const router = Router();

router.use(requireAuth);

router.get('/', addressController.listAddresses);
router.get('/:id', validate(addressIdParamSchema), addressController.getAddress);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', validate(addressIdParamSchema), addressController.deleteAddress);

export default router;
