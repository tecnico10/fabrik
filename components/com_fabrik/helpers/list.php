<?php
/**
* @package		Joomla
* @subpackage	Fabrik
* @copyright	Copyright (C) 2005 Fabrik. All rights reserved.
* @license		GNU General Public License version 2 or later; see LICENSE.txt
*/

// Check to ensure this file is included in Joomla!
defined('_JEXEC') or die();

/**
* List Helper class
*
* @package		Joomla
* @subpackage	Fabrik.helpers
*/

class FabrikHelperList
{

	/**
	 * Get a list of elements which match a set of criteria
	 *
	 * @param   object  $listModel  list model to search
	 * @param   array   $filter     array of element properties to match on
	 *
	 * @throws Exception
	 *
	 * @return  array
	 */

	public static function getElements($listModel, $filter = array())
	{
		$found = array();

		$groups = $listModel->getFormGroupElementData();
		foreach ($groups as $groupModel)
		{
			$elementModels = $groupModel->getMyElements();
			foreach ($elementModels as $elementModel)
			{
				$item = $elementModel->getElement();
				$ok = true;
				foreach ($filter as $key => $val)
				{
					if ($item->$key != $val)
					{
						$ok = false;
					}
				}
				if ($ok)
				{
					$found[] = $elementModel;
				}

			}
		}

		if (empty($found))
		{
			throw new Exception(JText::_('COM_FABRIK_ERR_NO_ELEMENTS_MATCHED_FILTER'));
		}
		return $found;
	}
}
