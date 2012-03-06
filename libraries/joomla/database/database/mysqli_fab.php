<?php
/**
 * @version		$Id: mysql.php 18554 2010-08-21 03:19:19Z ian $
 * @package		Joomla.Framework
 * @subpackage	Database
 * @copyright	Copyright (C) 2005 - 2010 Open Source Matters, Inc. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('JPATH_BASE') or die;

/**
 * MySQL database driver
 *
 * @package		Joomla.Framework
 * @subpackage	Database
 * @since		1.0
 */
class JDatabaseMySQLi_Fab extends JDatabaseMySQLi
{
	/**
	 * The database driver name
	 *
	 * @var string
	 */
	public $name = 'mysqli_fab';

	/**
	 * This function replaces a string identifier <var>$prefix</var> with the
	 * string held is the <var>_table_prefix</var> class variable.
	 *
	 * @param	string	The SQL query
	 * @param	string	The common table prefix
	 */
	public function replacePrefix($sql, $prefix='#__')
	{
		$app = JFactory::getApplication();
		$package = $app->getUserStateFromRequest('com_fabrik.package', 'package', 'fabrik');
		$pid = JRequest::getInt('packageid', 0);
		if ($pid !== 0) 
		{
			$db = JFactory::getDbo();
			$query = $db->getQuery(true);
			$query->select('component_name')->from('#__fabrik_packages')->where('id = ' . (int) $pid);
			$db->setQuery($query);
			$p = $db->loadResult();
			if ($p != '')
			{
				$package = $p;
				$app->setUserState('com_fabrik.package', $package);
			}
		}
		$sql = str_replace('{package}', $package, $sql);
		return parent::replacePrefix($sql, $prefix);
	}

}
