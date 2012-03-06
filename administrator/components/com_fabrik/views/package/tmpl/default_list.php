<form name="adminForm" id="adminForm" action="">
	<fieldset class="adminform">
		<ul class="adminformlist">
		<?php foreach ($this->listform->getFieldset('details') as $field): ?>
		<li>
			<?php echo $field->label . $field->input; ?>
		</li>
		<?php endforeach; ?>
		</ul>
	</fieldset>
</form>